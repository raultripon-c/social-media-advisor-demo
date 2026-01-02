export const applySmsCampaignDomAdapter = () => {
  const performDomOperation = () => {
    const wrapper = document.querySelector('.sms-campaign .main');
    const child = wrapper?.querySelector('app-new-pagination');

    if (wrapper && child && wrapper.parentNode) {
      wrapper.parentNode.insertBefore(child, wrapper.nextSibling);
      return true;
    }
    return false;
  };

  if (performDomOperation()) {
    return;
  }

  const targetNode = document.querySelector('#child-module-renderer');
  if (!targetNode) {
    return;
  }

  const observer = new MutationObserver(() => {
    if (performDomOperation()) {
      observer.disconnect();
    }
  });

  observer.observe(targetNode, {
    childList: true,
    subtree: true,
  });
};

