export const removeElementsById = (identificationId: string) => {
    const allTags = document.querySelectorAll(`#${identificationId}`);
    allTags.forEach(tag => tag.remove());
}

export const loadScriptById = (scriptId: string, src: string, onLoad?: any) => {
    removeElementsById(scriptId);
    const script = document.createElement('script');
    script.id = scriptId;
    script.src = src;
    script.onload = () => {
        if (onLoad) {
            onLoad();
        }
    };
    document.head.appendChild(script);
}