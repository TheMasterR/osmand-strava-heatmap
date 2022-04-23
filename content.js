insertModalHtml();
insertButtonHtml();

/**
 * Insert HTML skeleton for modal dialog box.
 * To be filled with content when the user clicks the button to open.
 */
function insertModalHtml() {
  document.body.insertAdjacentHTML(
    "afterbegin",
    `
        <div id="jsh-modal" class="jsh-modal">
            <div id="jsh-modal-dialog" class="jsh-modal-dialog">
                <h4 id="jsh-modal-header" class="modal-header"></h4>
                <div id="jsh-modal-body" class="modal-body"></div>
            </div>
        </div>
    `
  );
  document.querySelector("#jsh-modal").addEventListener("click", (e) => {
    e.target.classList.remove("active");
  });
}

/**
 * Insert HTML for modal toggle button
 */
async function insertButtonHtml() {
  let ctrl_top_right = document.querySelector(".mapboxgl-ctrl-top-right");
  // Sometimes the mapbox controls aren't loaded right away and we need to wait a little bit
  for (let i = 0; ctrl_top_right === null && i < 10; i++) {
    await new Promise((r) => setTimeout(r, 300));
    ctrl_top_right = document.querySelector(".mapboxgl-ctrl-top-right");
  }
  let button = document.createElement("button");
  button.className = "jsh-modal-toggle";
  button.innerHTML = `
<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:serif="http://www.serif.com/" width="40px" height="40px" viewBox="0 -1.5 2253 2253" version="1.1" xml:space="preserve" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:1.5;">
  <rect id="Heatmap" x="1.997" y="0" width="2250" height="2250" style="fill:none;"></rect>
  <rect x="135.331" y="133.333" width="495.833" height="495.833" style="fill:#1c4e80;stroke:#202020;stroke-width:66.67px;"></rect>
  <rect x="631.164" y="133.333" width="495.833" height="495.833" style="fill:#1c4e80;stroke:#202020;stroke-width:66.67px;"></rect>
  <rect x="1127" y="133.333" width="495.833" height="495.833" style="fill:#eee;stroke:#202020;stroke-width:66.67px;"></rect>
  <rect x="1622.83" y="133.333" width="495.833" height="495.833" style="fill:#ea6a47;stroke:#202020;stroke-width:66.67px;"></rect>
  <rect x="135.331" y="629.167" width="495.833" height="495.833" style="fill:#1c4e80;stroke:#202020;stroke-width:66.67px;"></rect>
  <rect x="135.331" y="1125" width="495.833" height="495.833" style="fill:#eee;stroke:#202020;stroke-width:66.67px;"></rect>
  <rect x="135.331" y="1620.83" width="495.833" height="495.833" style="fill:#eee;stroke:#202020;stroke-width:66.67px;"></rect>
  <rect x="631.164" y="629.167" width="495.833" height="495.833" style="fill:#eee;stroke:#202020;stroke-width:66.67px;"></rect>
  <rect x="631.164" y="1125" width="495.833" height="495.833" style="fill:#eee;stroke:#202020;stroke-width:66.67px;"></rect>
  <rect x="631.164" y="1620.83" width="495.833" height="495.833" style="fill:#eee;stroke:#202020;stroke-width:66.67px;"></rect>
  <rect x="1127" y="629.167" width="495.833" height="495.833" style="fill:#eee;stroke:#202020;stroke-width:66.67px;"></rect>
  <rect x="1127" y="1125" width="495.833" height="495.833" style="fill:#eee;stroke:#202020;stroke-width:66.67px;"></rect>
  <rect x="1127" y="1620.83" width="495.833" height="495.833" style="fill:#ea6a47;stroke:#202020;stroke-width:66.67px;"></rect>
  <rect x="1622.83" y="629.167" width="495.833" height="495.833" style="fill:#ea6a47;stroke:#202020;stroke-width:66.67px;"></rect>
  <rect x="1622.83" y="1125" width="495.833" height="495.833" style="fill:#ea6a47;stroke:#202020;stroke-width:66.67px;"></rect>
  <rect x="1622.83" y="1620.83" width="495.833" height="495.833" style="fill:#ea6a47;stroke:#202020;stroke-width:66.67px;"></rect>
</svg>
    `;
  ctrl_top_right.prepend(button);
  button.addEventListener("click", openModalDialog);
}

/**
 * Event listener function to open the modal dialog box and populate its content.
 * If cookies are found, content will show the heatmap url and various actions.
 * If not found, the content will show an error message instead.
 */
async function openModalDialog(e) {
  let map_color = document
    .querySelector(".map-color.active")
    .getAttribute("data-color");
  let map_type = document
    .querySelector(".map-type.active")
    .getAttribute("data-type");

  // Attempt to build the heatmap url from key pair, policy, and signature cookies
  try {
    let response = await browser.runtime.sendMessage({
      name: "getHeatmapUrl",
      map_color: map_color ?? "hot",
      map_type: map_type ?? "all",
    });
    if (response.error) {
      setModalHtmlError(
        "Error: missing cookies",
        "One or more cookies not found - 'CloudFront-Key-Pair-Id', 'CloudFront-Policy', 'CloudFront-Signature'"
      );
    } else {
      setModalHtmlSuccess(response.heatmap_url, map_color, map_type);
    }
  } catch (err) {
    console.log(err);
    setModalHtmlError(
      "Unknown error",
      "Couldn't build url.  Check console for errors."
    );
  }

  // Open the modal now containing a success or failure message
  document.querySelector("#jsh-modal").classList.add("active");
}

/**
 * Set the HTML content of the modal after successfully building the heatmap url
 */
function setModalHtmlSuccess(heatmap_url, map_color, map_type) {
  let title = `Strava Heatmap (${map_color}/${map_type})`;

  document.querySelector("#jsh-modal-header").textContent = title || "Error";
  document.querySelector("#jsh-modal-body").innerHTML = `
        <ul>
            <li><b>Add as overlay</b> (Add online source)</li>
            <li><b>Name</b>: Strava Heatmap</li>
            <li><b>Url</b>: <code>
            <button id="jsh-click-to-copy" class="copy-button btn btn-xs" aria-label="Copy to clipboard" title="Copy to clipboard">
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#000000">
                    <path d="M0 0h24v24H0V0z" fill="none" />
                    <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
                </svg>
            </button>
            <pre id="jsh-imagery-url"></pre>
        </code></li>
            <li> <b>Zoom Levels</b>: 
                <ul>
                    <li><b>Minimum</b>: 1</li>
                    <li><b>Maximum</b>: 15</li>
                </ul>
            </li>
            <li><b>Expire time</b>: 43200</li>
            <li><b>Source format</b>: One image per tile</li>
            <li><b>Set transparancy to 0%</b> (or what ever suits you)</li>
        </ul>
    `;
  document.querySelector("#jsh-imagery-url").textContent = heatmap_url;
  document
    .querySelector("#jsh-click-to-copy")
    .addEventListener("click", copyUrlToClipboard);
}

/**
 * Set the HTML content of the modal with an error message
 * after failure building the heatmap url
 */
function setModalHtmlError(header, body) {
  document.querySelector("#jsh-modal-header").textContent = header;
  document.querySelector("#jsh-modal-body").textContent = body;
}

/**
 * Event listener function to copy the heatmap url on click
 */
function copyUrlToClipboard() {
  let heatmap_url_manual_copy =
    document.querySelector("#jsh-imagery-url").textContent;
  navigator.clipboard.writeText(heatmap_url_manual_copy);
}
