export function subscribeWalletEvents(getProvider, handlers, onError) {
  let provider;
  let removeListener;
  const registered = [];
  const cleanup = () => {
    for (const [event, handler] of registered.splice(0)) {
      try {
        removeListener.call(provider, event, handler);
      } catch (error) {
        onError(error);
      }
    }
  };

  try {
    provider = getProvider();
    if (!provider) return cleanup;
    const on = provider.on;
    removeListener = provider.removeListener;
    if (typeof on !== 'function' || typeof removeListener !== 'function') {
      throw new TypeError('Wallet event subscriptions are unavailable.');
    }
    for (const [event, handler] of Object.entries(handlers)) {
      registered.push([event, handler]);
      on.call(provider, event, handler);
    }
  } catch (error) {
    cleanup();
    onError(error);
  }
  return cleanup;
}
