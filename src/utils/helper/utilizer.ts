export const removeElementsById = (identificationId: string) => {
    const allTags = document.querySelectorAll(`#${identificationId}`);
    allTags.forEach(tag => tag.remove());
}