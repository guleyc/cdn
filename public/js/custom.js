/**
 * Mobile table functionality
 * Handles click-to-expand functionality on mobile devices
 */
document.addEventListener("DOMContentLoaded", function () {
  function initMobileTable() {
    // Only apply mobile functionality on smaller screens
    if (window.innerWidth <= 768) {
      const tableRows = document.querySelectorAll(".table-mobile tbody tr");

      // Remove existing event listeners by cloning elements
      tableRows.forEach((row) => {
        const newRow = row.cloneNode(true);
        row.parentNode.replaceChild(newRow, row);
      });

      // Add new event listeners to cloned elements
      document.querySelectorAll(".table-mobile tbody tr").forEach((row) => {
        row.addEventListener("click", function (e) {
          // Don't trigger if clicking on a link or button
          if (e.target.closest("a") || e.target.closest("button")) {
            return;
          }

          e.preventDefault();
          e.stopPropagation();

          const mobileDetails = this.querySelector(".mobile-details");
          if (!mobileDetails) return;

          const isOpen = mobileDetails.classList.contains("show");

          // Close all other open details
          document
            .querySelectorAll(".mobile-details.show")
            .forEach((detail) => {
              if (detail !== mobileDetails) {
                detail.classList.remove("show");
              }
            });

          // Toggle current details
          if (!isOpen) {
            mobileDetails.classList.add("show");
          } else {
            mobileDetails.classList.remove("show");
          }
        });
      });
    }
  }

  // Initialize on page load
  initMobileTable();

  // Re-initialize on window resize
  let resizeTimeout;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(initMobileTable, 250);
  });

  // Re-initialize when new content is loaded (for AJAX content)
  const observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
        // Check if new table rows were added
        const hasNewRows = Array.from(mutation.addedNodes).some(
          (node) =>
            node.nodeType === 1 &&
            (node.matches("tr") || node.querySelector("tr"))
        );

        if (hasNewRows) {
          setTimeout(initMobileTable, 100);
        }
      }
    });
  });

  // Start observing the table body for changes
  const tableBody = document.querySelector("#listings-tbody");
  if (tableBody) {
    observer.observe(tableBody, {
      childList: true,
      subtree: true,
    });
  }
});
