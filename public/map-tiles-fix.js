/**
 * Google Maps Tile Rendering Fix
 *
 * Workaround for a race condition in Turbopack dev mode where Google Maps
 * tiles download but don't render until a resize event is triggered.
 * This script runs outside of React's module system to dispatch the resize event.
 */
(function() {
  var attempts = 0;
  var maxAttempts = 20;

  function checkAndTriggerResize() {
    attempts++;
    var gmStyle = document.querySelector('.gm-style');
    var tileImages = document.querySelectorAll('.gm-style img[src*="khms"], .gm-style img[src*="tile"]');

    if (gmStyle && tileImages.length === 0 && attempts < maxAttempts) {
      window.dispatchEvent(new Event('resize'));
      console.log('[MapTilesFix] Attempt ' + attempts + ': Triggered resize');
      setTimeout(checkAndTriggerResize, 300);
    } else if (tileImages.length > 0) {
      console.log('[MapTilesFix] Tiles rendered after ' + attempts + ' attempts');
    } else if (attempts >= maxAttempts) {
      console.log('[MapTilesFix] Max attempts reached, tiles may not have rendered');
    }
  }

  // Start checking after a delay to let the map initialize
  setTimeout(checkAndTriggerResize, 500);
})();
