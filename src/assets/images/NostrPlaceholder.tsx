import * as React from 'react';

const SvgParticipantPlaceholder = (props: React.SVGProps<SVGSVGElement>) => (
  // temporary placeholder, to be customized with nostr avatars.
<svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" width="100" zoomAndPan="magnify" viewBox="0 0 75 74.999997" height="100" preserveAspectRatio="xMidYMid meet" version="1.0"><defs><clipPath id="952a9c59c2"><path d="M 5 6 L 68 6 L 68 68.949219 L 5 68.949219 Z M 5 6 " clipRule="nonzero"/></clipPath></defs><g clipPath="url(#952a9c59c2)"><path fill="#303030" d="M 35.054688 6.457031 C 30.230469 6.707031 25.445312 8.101562 21.28125 10.472656 C 16.914062 12.957031 13.171875 16.5 10.457031 20.714844 C 8.050781 24.445312 6.503906 28.550781 5.839844 32.960938 C 5.570312 34.730469 5.53125 35.304688 5.53125 37.570312 C 5.53125 39.875 5.570312 40.421875 5.859375 42.316406 C 6.546875 46.800781 8.128906 50.902344 10.632812 54.703125 C 12.972656 58.253906 16.085938 61.355469 19.640625 63.675781 C 23.949219 66.484375 28.78125 68.152344 33.992188 68.621094 C 35.132812 68.726562 37.957031 68.742188 39.019531 68.648438 C 43.84375 68.230469 48.128906 66.90625 52.171875 64.582031 C 56.351562 62.183594 60.011719 58.730469 62.675781 54.679688 C 68.929688 45.167969 69.5 32.957031 64.152344 22.957031 C 62.632812 20.117188 60.929688 17.824219 58.625 15.523438 C 56.21875 13.121094 53.703125 11.296875 50.660156 9.753906 C 45.875 7.328125 40.421875 6.175781 35.054688 6.457031 M 50.359375 16.15625 C 49.644531 16.351562 49.238281 16.816406 48.941406 17.792969 C 48.796875 18.269531 48.78125 19.195312 48.910156 19.71875 C 49.144531 20.65625 49.625 21.496094 50.324219 22.1875 C 50.542969 22.40625 51.101562 22.90625 51.5625 23.304688 C 52.394531 24.019531 53.117188 24.746094 53.386719 25.148438 C 53.957031 26 53.878906 27.46875 53.191406 28.792969 C 52.886719 29.378906 52.070312 29.953125 51.320312 30.117188 C 51.136719 30.15625 50.703125 30.203125 50.359375 30.21875 C 49.25 30.269531 48.890625 30.179688 45.410156 28.933594 C 43.875 28.386719 43.058594 28.144531 42.300781 28.015625 C 41.738281 27.917969 41.546875 27.910156 40.65625 27.9375 C 37.554688 28.03125 35.0625 28.761719 31.789062 30.539062 C 30.539062 31.21875 29.875 31.46875 28.640625 31.722656 C 28.144531 31.828125 26.746094 31.984375 25.714844 32.050781 C 23.316406 32.210938 22.234375 32.355469 21.226562 32.65625 C 20.195312 32.964844 19.628906 33.265625 19.070312 33.789062 C 18.164062 34.636719 17.5625 36.191406 17.722656 37.257812 C 17.820312 37.914062 18.558594 38.558594 20.371094 39.578125 C 20.945312 39.898438 21.035156 39.933594 21.34375 39.953125 C 21.78125 39.980469 22.132812 39.859375 22.734375 39.472656 C 23.308594 39.101562 23.980469 38.785156 24.480469 38.65625 C 25.039062 38.511719 25.90625 38.441406 26.390625 38.503906 C 26.847656 38.558594 27.101562 38.664062 27.59375 38.992188 C 28.019531 39.277344 28.613281 39.574219 29.316406 39.851562 C 29.789062 40.042969 31.433594 40.554688 32.164062 40.746094 C 32.59375 40.855469 33.007812 41.054688 33.078125 41.183594 C 33.171875 41.359375 33.039062 41.546875 32.273438 42.292969 C 31.042969 43.496094 29.378906 44.871094 28.816406 45.15625 C 28.367188 45.378906 27.941406 45.777344 27.742188 46.148438 C 27.65625 46.308594 27.527344 46.644531 27.453125 46.894531 C 27.375 47.144531 27.273438 47.425781 27.222656 47.527344 C 27.175781 47.625 26.367188 48.804688 25.425781 50.144531 C 24.488281 51.488281 23.519531 52.878906 23.269531 53.238281 C 22.617188 54.179688 22.378906 54.339844 21.429688 54.480469 C 20.832031 54.570312 20.460938 54.769531 20.292969 55.09375 C 20.199219 55.269531 20.203125 55.71875 20.296875 56.164062 C 20.414062 56.710938 20.398438 56.847656 20.144531 57.398438 C 19.75 58.261719 19.707031 58.417969 19.679688 59.128906 C 19.644531 60.039062 19.761719 60.324219 20.171875 60.324219 C 20.480469 60.324219 20.597656 60.210938 20.90625 59.605469 C 21.242188 58.949219 21.351562 58.792969 22.0625 58 C 22.53125 57.472656 22.964844 56.90625 24.914062 54.277344 C 25.230469 53.847656 26.214844 52.5 27.101562 51.28125 C 27.988281 50.0625 28.832031 48.933594 28.980469 48.777344 C 29.179688 48.558594 29.371094 48.421875 29.746094 48.230469 C 30.480469 47.855469 30.832031 47.457031 31.035156 46.765625 C 31.097656 46.558594 31.167969 46.476562 31.625 46.105469 C 32.070312 45.734375 33.808594 44.378906 34.335938 43.980469 C 34.605469 43.777344 36.667969 42.886719 36.726562 42.945312 C 36.742188 42.960938 36.46875 43.425781 36.125 43.984375 C 34.996094 45.792969 34.289062 47.152344 34.183594 47.71875 C 34.097656 48.160156 34.121094 48.726562 34.226562 48.96875 C 34.347656 49.234375 34.6875 49.566406 34.917969 49.640625 C 35.019531 49.675781 35.242188 49.691406 35.417969 49.679688 C 35.691406 49.664062 35.835938 49.609375 36.457031 49.296875 C 36.894531 49.078125 37.4375 48.851562 37.835938 48.726562 C 43.761719 46.867188 44.027344 46.796875 44.226562 46.960938 C 44.265625 46.996094 44.324219 47.125 44.355469 47.253906 C 44.535156 47.964844 44.867188 48.203125 45.769531 48.273438 C 46.292969 48.316406 46.351562 48.335938 46.785156 48.65625 C 47.34375 49.070312 47.867188 49.058594 47.996094 48.632812 C 48.09375 48.296875 47.996094 48.109375 46.726562 46.210938 C 46.347656 45.644531 45.945312 45.097656 45.839844 44.992188 C 45.574219 44.738281 45.230469 44.597656 44.789062 44.5625 C 44.347656 44.53125 44.335938 44.53125 39.929688 45.882812 C 38.253906 46.394531 36.875 46.804688 36.863281 46.792969 C 36.804688 46.738281 38.402344 44.523438 39.148438 43.617188 C 39.679688 42.96875 40.015625 42.652344 40.453125 42.386719 C 40.894531 42.117188 41.339844 41.976562 42.421875 41.777344 C 44.316406 41.421875 46.730469 40.734375 47.492188 40.335938 C 48.222656 39.949219 48.863281 39.105469 49.226562 38.046875 C 49.480469 37.296875 49.652344 36.261719 49.652344 35.4375 C 49.652344 34.769531 49.800781 34.523438 50.433594 34.15625 C 51.929688 33.285156 53.46875 31.953125 54.257812 30.851562 C 55.511719 29.097656 55.914062 26.875 55.304688 25.074219 C 54.921875 23.945312 54.417969 23.320312 52.875 22.0625 C 52.011719 21.363281 51.347656 20.699219 51.234375 20.433594 C 51.128906 20.183594 51.148438 19.863281 51.277344 19.601562 C 51.527344 19.109375 51.964844 18.988281 53.609375 18.96875 C 54.882812 18.953125 55.023438 18.9375 55.304688 18.792969 C 55.457031 18.714844 55.496094 18.667969 55.496094 18.554688 C 55.496094 18.242188 55.167969 18.007812 54.425781 17.792969 C 53.714844 17.589844 53.515625 17.484375 52.878906 16.960938 C 51.914062 16.171875 51.175781 15.9375 50.359375 16.15625 " fillOpacity="1" fillRule="evenodd"/></g></svg>
    
);
export default SvgParticipantPlaceholder;

