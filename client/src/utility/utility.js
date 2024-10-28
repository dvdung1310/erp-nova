/**
 * Return ellipsis of a given string
 * @param {string} text
 * @param {number} size
 */
export const ellipsis = (text, size) => {
  return `${text.split(' ').slice(0, size).join(' ')}...`;
};
export const urlBase64ToUint8Array = (base64String = '') => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}