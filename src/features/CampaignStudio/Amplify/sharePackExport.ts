import { SharePack } from "./amplifyTypes";

const sanitizeFileName = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "share-pack";

const crc32Table = Array.from({ length: 256 }, (_, index) => {
  let crc = index;
  for (let bit = 0; bit < 8; bit += 1) {
    crc = crc & 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1;
  }
  return crc >>> 0;
});

const getCrc32 = (data: Uint8Array) => {
  let crc = 0xffffffff;
  data.forEach((byte) => {
    crc = crc32Table[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  });
  return (crc ^ 0xffffffff) >>> 0;
};

const pushUint16 = (target: number[], value: number) => {
  target.push(value & 0xff, (value >>> 8) & 0xff);
};

const pushUint32 = (target: number[], value: number) => {
  target.push(value & 0xff, (value >>> 8) & 0xff, (value >>> 16) & 0xff, (value >>> 24) & 0xff);
};

const createStoredZipBlob = (files: Array<{ name: string; content: string | Uint8Array }>) => {
  const encoder = new TextEncoder();
  const chunks: Uint8Array[] = [];
  const centralDirectory: Uint8Array[] = [];
  let offset = 0;

  files.forEach((file) => {
    const name = encoder.encode(file.name);
    const data = typeof file.content === "string" ? encoder.encode(file.content) : file.content;
    const crc = getCrc32(data);
    const localHeader: number[] = [];

    pushUint32(localHeader, 0x04034b50);
    pushUint16(localHeader, 20);
    pushUint16(localHeader, 0);
    pushUint16(localHeader, 0);
    pushUint16(localHeader, 0);
    pushUint16(localHeader, 0);
    pushUint32(localHeader, crc);
    pushUint32(localHeader, data.length);
    pushUint32(localHeader, data.length);
    pushUint16(localHeader, name.length);
    pushUint16(localHeader, 0);

    chunks.push(new Uint8Array(localHeader), name, data);

    const centralHeader: number[] = [];
    pushUint32(centralHeader, 0x02014b50);
    pushUint16(centralHeader, 20);
    pushUint16(centralHeader, 20);
    pushUint16(centralHeader, 0);
    pushUint16(centralHeader, 0);
    pushUint16(centralHeader, 0);
    pushUint16(centralHeader, 0);
    pushUint32(centralHeader, crc);
    pushUint32(centralHeader, data.length);
    pushUint32(centralHeader, data.length);
    pushUint16(centralHeader, name.length);
    pushUint16(centralHeader, 0);
    pushUint16(centralHeader, 0);
    pushUint16(centralHeader, 0);
    pushUint16(centralHeader, 0);
    pushUint32(centralHeader, 0);
    pushUint32(centralHeader, offset);

    centralDirectory.push(new Uint8Array(centralHeader), name);
    offset += localHeader.length + name.length + data.length;
  });

  const centralDirectorySize = centralDirectory.reduce((sum, chunk) => sum + chunk.length, 0);
  const endRecord: number[] = [];
  pushUint32(endRecord, 0x06054b50);
  pushUint16(endRecord, 0);
  pushUint16(endRecord, 0);
  pushUint16(endRecord, files.length);
  pushUint16(endRecord, files.length);
  pushUint32(endRecord, centralDirectorySize);
  pushUint32(endRecord, offset);
  pushUint16(endRecord, 0);

  return new Blob([...chunks, ...centralDirectory, new Uint8Array(endRecord)], { type: "application/zip" });
};

const getMediaExtension = (src: string, kind: "image" | "video") => {
  const cleanUrl = src.split("?")[0];
  const extension = cleanUrl.match(/\.(png|jpe?g|webp|gif|mp4|webm|mov)$/i)?.[1]?.toLowerCase();
  if (extension) return extension === "jpeg" ? "jpg" : extension;
  return kind === "video" ? "mp4" : "png";
};

const getPackAssets = (pack: SharePack) => {
  if (pack.assets?.length) return pack.assets;
  return [{ src: pack.thumbnailUrl, kind: pack.mediaType, label: pack.title }];
};

const createSharePackContentText = (pack: SharePack) => {
  const captionLines = pack.captions.map((caption, index) => `${index + 1}. ${caption.text}`).join("\n");
  const lines = [
    pack.title,
    "",
    ...(pack.employeeNote?.trim()
      ? ["Note to employees:", pack.employeeNote.trim(), ""]
      : []),
    `Destination: ${pack.ctaDestination}`,
    `CTA: ${pack.ctaLabel}`,
    "",
    "Share captions:",
    captionLines,
    "",
    "UTM preview:",
    pack.utmPreview,
  ];
  return lines.join("\n");
};

const createCaptionsText = (pack: SharePack) =>
  pack.captions.map((caption, index) => `${index + 1}. ${caption.text}`).join("\n\n");

export const downloadSharePackContentZip = async (pack: SharePack) => {
  const files: Array<{ name: string; content: string | Uint8Array }> = [
    {
      name: "captions.txt",
      content: createCaptionsText(pack),
    },
    {
      name: `${sanitizeFileName(pack.title)}-share-pack-content.txt`,
      content: createSharePackContentText(pack),
    },
  ];

  const assets = getPackAssets(pack);
  const assetFiles = await Promise.all(
    assets.map(async (asset, index) => {
      const fileBaseName = `media/${String(index + 1).padStart(2, "0")}-${sanitizeFileName(asset.label)}`;
      try {
        const response = await fetch(asset.src);
        if (!response.ok) {
          return {
            name: `${fileBaseName}-download-link.txt`,
            content: asset.src,
          };
        }
        const mediaData = new Uint8Array(await response.arrayBuffer());
        return {
          name: `${fileBaseName}.${getMediaExtension(asset.src, asset.kind)}`,
          content: mediaData,
        };
      } catch {
        return {
          name: `${fileBaseName}-download-link.txt`,
          content: asset.src,
        };
      }
    }),
  );

  files.push(...assetFiles);
  const zipBlob = createStoredZipBlob(files);
  const url = URL.createObjectURL(zipBlob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${sanitizeFileName(pack.title)}-content.zip`;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
};
