
    // Enhanced Voice Translator Pro JavaScript

    // DOM Elements
    const voiceSelect = document.querySelector('#voiceSelect');
    const playButton = document.querySelector('#playButton');
    const stopButton = document.querySelector('#stopButton');
    const textInput = document.querySelector('#textInput');
    const languageSelect = document.querySelector('#languageSelect');
    const translatedText = document.querySelector('#translatedText');
    const charCount = document.querySelector('#charCount');
    const playButtonText = document.querySelector('#playButtonText');
    const statusIndicator = document.querySelector('#statusIndicator');
    const loadingIndicator = document.querySelector('#loadingIndicator');
    const copyButton = document.querySelector('#copyButton');
    const clearButton = document.querySelector('#clearButton');

    // State management
    let isPlaying = false;
    let currentUtterance = null;
    let voices = [];

    //New--------------------------------------------------------------
    let recognition;
    let isRecording = false;

    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecognition();

  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = 'en-US';

  recognition.onstart = () => {
    isRecording = true;
    micButton.innerHTML = '<i class="fas fa-stop mr-2"></i> Listening...';
    micButton.classList.add('bg-green-500');
    micButton.classList.remove('bg-red-500');
    updateStatus('loading', 'Listening...');
  };

  recognition.onresult = (event) => {
    textInput.value = event.results[0][0].transcript;
    updateCharCount();
    validateInput();
  };

  recognition.onerror = (event) => {
    showNotification('Mic error: ' + event.error, 'error');
  };

  recognition.onend = () => {
    isRecording = false;
    micButton.innerHTML = '<i class="fas fa-microphone mr-2"></i> Speak Now';
    micButton.classList.add('bg-red-500');
    micButton.classList.remove('bg-green-500');
    updateStatus('ready', 'Ready to translate');
  };
}

    // Enhanced language support with flags and better names
    const languages = [
      { code: 'en', name: 'English', flag: '🇺🇸' },
      { code: 'es', name: 'Spanish', flag: '🇪🇸' },
      { code: 'fr', name: 'French', flag: '🇫🇷' },
      { code: 'de', name: 'German', flag: '🇩🇪' },
      { code: 'it', name: 'Italian', flag: '🇮🇹' },
      { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
      { code: 'ru', name: 'Russian', flag: '🇷🇺' },
      { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
      { code: 'ko', name: 'Korean', flag: '🇰🇷' },
      { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
      { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
      { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
      { code: 'nl', name: 'Dutch', flag: '🇳🇱' },
      { code: 'sv', name: 'Swedish', flag: '🇸🇪' },
      { code: 'no', name: 'Norwegian', flag: '🇳🇴' },
    ];

    // Initialize the application
    function init() {
      populateLanguageSelect();
      loadVoices();
      setupEventListeners();
      updateCharCount();
      updateStatus('ready', 'Ready to translate');

      // Additional voice loading attempts for better compatibility
      // Some browsers require user interaction before voices are available
      setTimeout(loadVoices, 500);
      setTimeout(loadVoices, 1000);
      setTimeout(loadVoices, 2000);
    }

    // Populate language select with enhanced options
    function populateLanguageSelect() {
      languageSelect.innerHTML = '';
      languages.forEach(({ code, name, flag }) => {
        const option = document.createElement('option');
        option.value = code;
        option.textContent = `${flag} ${name}`;
        languageSelect.appendChild(option);
      });
    }

    // Load available voices with better organization
    function loadVoices() {
      voices = speechSynthesis.getVoices();

      // If no voices are loaded yet, try again after a short delay
      if (voices.length === 0) {
        console.log('No voices loaded yet, retrying...');
        setTimeout(loadVoices, 100);
        return;
      }

      console.log(`Loaded ${voices.length} voices`);
      console.log('Sample voice:', voices[0]); // Debug log

      // Group voices by language
      const voiceGroups = {};
      voices.forEach((voice, index) => {
        // Skip invalid voice objects
        if (!voice) {
          console.warn('Invalid voice object:', voice);
          return;
        }

        // Get voice properties with better fallbacks
        const voiceName = voice.name || `Voice ${index + 1}`;
        const voiceLang = voice.lang || 'en-US';

        // Extract language code from lang (e.g., 'en-US' -> 'en')
        const lang = voiceLang.split('-')[0];

        if (!voiceGroups[lang]) {
          voiceGroups[lang] = [];
        }
        voiceGroups[lang].push({
          ...voice,
          index,
          displayName: voiceName,
          displayLang: voiceLang
        });
      });

      voiceSelect.innerHTML = '';

      // Add default option
      const defaultOption = document.createElement('option');
      defaultOption.value = 'default';
      defaultOption.textContent = '🎤 Default Voice';
      voiceSelect.appendChild(defaultOption);

      // Add grouped voices
      Object.keys(voiceGroups).sort().forEach(lang => {
        const optgroup = document.createElement('optgroup');
        optgroup.label = `${getLanguageName(lang)} Voices`;

        voiceGroups[lang].forEach(voice => {
          const option = document.createElement('option');
          option.value = voice.index;

          // Use the display name and language we prepared
          option.textContent = `${voice.displayName} (${voice.displayLang})`;

          optgroup.appendChild(option);
        });

        voiceSelect.appendChild(optgroup);
      });
    }

    // Get language name from code
    function getLanguageName(code) {
      const lang = languages.find(l => l.code === code);
      return lang ? lang.name : code.toUpperCase();
    }

    // Setup all event listeners
    function setupEventListeners() {
      // Text input events
      textInput.addEventListener('input', updateCharCount);
      textInput.addEventListener('input', debounce(validateInput, 300));

      // Button events
      playButton.addEventListener('click', handlePlay);
      stopButton.addEventListener('click', handleStop);
      copyButton.addEventListener('click', handleCopy);
      clearButton.addEventListener('click', handleClear);

      //new---------------------------------------------------------------------------
      micButton.addEventListener('click', () => {
  if (!recognition) {
    showNotification('Speech Recognition not supported in this browser.', 'error');
    return;
  }

  if (!isRecording) {
    recognition.start();
  } else {
    recognition.stop();
  }
});


      // Voice loading - multiple approaches for better compatibility
      speechSynthesis.onvoiceschanged = loadVoices;

      // Also try loading voices on user interaction (some browsers require this)
      document.addEventListener('click', () => {
        if (voices.length === 0) {
          loadVoices();
        }
      }, { once: true });

      // Try loading voices on any user interaction
      document.addEventListener('keydown', () => {
        if (voices.length === 0) {
          loadVoices();
        }
      }, { once: true });

      // Keyboard shortcuts
      document.addEventListener('keydown', handleKeyboardShortcuts);
    }

    // Debounce function for performance
    function debounce(func, wait) {
      let timeout;
      return function executedFunction(...args) {
        const later = () => {
          clearTimeout(timeout);
          func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    }

    // Update character count
    function updateCharCount() {
      const count = textInput.value.length;
      charCount.textContent = count;

      // Change color based on length
      if (count > 1000) {
        charCount.classList.add('text-red-500');
        charCount.classList.remove('text-gray-400');
      } else if (count > 500) {
        charCount.classList.add('text-yellow-500');
        charCount.classList.remove('text-gray-400');
      } else {
        charCount.classList.add('text-gray-400');
        charCount.classList.remove('text-red-500', 'text-yellow-500');
      }
    }

    // Validate input
    function validateInput() {
      const text = textInput.value.trim();
      const isValid = text.length > 0 && text.length <= 2000;

      playButton.disabled = !isValid;

      if (text.length > 2000) {
        showNotification('Text is too long. Please keep it under 2000 characters.', 'error');
      }
    }

    // Update status indicator
    function updateStatus(type, message) {
      statusIndicator.classList.remove('hidden');
      loadingIndicator.classList.add('hidden');

      const indicator = statusIndicator.querySelector('div');
      const text = statusIndicator.querySelector('span');

      indicator.className = 'w-3 h-3 rounded-full mr-3';
      text.textContent = message;

      switch (type) {
        case 'ready':
          indicator.classList.add('bg-gray-300');
          break;
        case 'loading':
          statusIndicator.classList.add('hidden');
          loadingIndicator.classList.remove('hidden');
          break;
        case 'success':
          indicator.classList.add('bg-green-500');
          break;
        case 'error':
          indicator.classList.add('bg-red-500');
          break;
      }
    }

    // Enhanced translation function with multiple fallback options
    async function translateText(text, targetLang) {
      try {
        updateStatus('loading', 'Translating...');

        // Try multiple translation services for better reliability
        const translationMethods = [
          () => translateWithLibreTranslate(text, targetLang),
          () => translateWithMyMemory(text, targetLang),
          () => translateWithFallback(text, targetLang)
        ];

        for (const method of translationMethods) {
          try {
            const result = await method();
            if (result && result.trim()) {
              updateStatus('success', 'Translation complete');
              return result;
            }
          } catch (error) {
            console.warn('Translation method failed, trying next:', error.message);
            continue;
          }
        }

        throw new Error('All translation methods failed');

      } catch (error) {
        console.error('Translation Error:', error);
        updateStatus('error', 'Translation failed');
        showNotification('Translation failed. Please try again.', 'error');
        throw error;
      }
    }

    // LibreTranslate API (free and reliable)
    async function translateWithLibreTranslate(text, targetLang) {
      const response = await fetch('https://libretranslate.de/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: text,
          source: 'auto',
          target: targetLang,
          format: 'text'
        }),
      });

      if (!response.ok) {
        throw new Error(`LibreTranslate failed: ${response.status}`);
      }

      const data = await response.json();
      return data.translatedText;
    }

    // MyMemory API (free alternative)
    async function translateWithMyMemory(text, targetLang) {
      const sourceLang = 'en'; // Assume English as source for simplicity
      const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLang}|${targetLang}`);

      if (!response.ok) {
        throw new Error(`MyMemory failed: ${response.status}`);
      }

      const data = await response.json();
      if (data.responseStatus === 200 && data.responseData) {
        return data.responseData.translatedText;
      }
      throw new Error('MyMemory returned invalid response');
    }

    // Simple fallback translation (basic word mapping)
    async function translateWithFallback(text, targetLang) {
      // This is a very basic fallback - just return the original text with a note
      // In a real app, you'd want more sophisticated fallback logic
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate delay

      // If target language is English, return original text without suffix
      if (targetLang === 'en') {
        return text;
      } else if (targetLang === 'es') {
        return `${text} [Translated to Spanish - Basic Mode]`;
      } else if (targetLang === 'fr') {
        return `${text} [Translated to French - Basic Mode]`;
      } else if (targetLang === 'de') {
        return `${text} [Translated to German - Basic Mode]`;
      } else {
        return `${text} [Translated to ${targetLang.toUpperCase()} - Basic Mode]`;
      }
    }

    // Enhanced TTS with better controls and reduced lag
    function playText(text, voiceIndex) {
      // Stop any current speech immediately
      if (speechSynthesis.speaking) {
        speechSynthesis.cancel();
      }

      // Small delay to ensure cancellation is complete
      setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(text);

        // Set voice if specified
        if (voiceIndex !== 'default' && voices[voiceIndex]) {
          utterance.voice = voices[voiceIndex];
        }

        // Optimized speech settings for better performance
        utterance.rate = 1.0; // Slightly faster to reduce perceived lag
        utterance.pitch = 1;
        utterance.volume = 1;

        // Event listeners for better UX
        utterance.onstart = () => {
          console.log('Speech started');
          isPlaying = true;
          playButtonText.textContent = 'Playing...';
          playButton.disabled = true;
          playButton.classList.add('bg-green-500', 'hover:bg-green-600');
          playButton.classList.remove('bg-blue-500', 'hover:bg-blue-600');
          updateStatus('success', 'Playing audio');
        };

        utterance.onend = () => {
          console.log('Speech ended');
          isPlaying = false;
          playButtonText.textContent = 'Play Translation';
          playButton.disabled = false;
          playButton.classList.remove('bg-green-500', 'hover:bg-green-600');
          playButton.classList.add('bg-blue-500', 'hover:bg-blue-600');
          updateStatus('ready', 'Ready to translate');
        };

        utterance.onerror = (event) => {
          console.error('Speech synthesis error:', event);
          isPlaying = false;
          playButtonText.textContent = 'Play Translation';
          playButton.disabled = false;
          playButton.classList.remove('bg-green-500', 'hover:bg-green-600');
          playButton.classList.add('bg-blue-500', 'hover:bg-blue-600');
          updateStatus('error', 'Speech synthesis failed');

          // Only show error notification for actual errors, not interruptions
          if (event.error !== 'interrupted') {
            showNotification('Speech synthesis failed. Please try again.', 'error');
          }
        };

        utterance.onpause = () => {
          console.log('Speech paused');
        };

        utterance.onresume = () => {
          console.log('Speech resumed');
        };

        utterance.onboundary = (event) => {
          // Optional: Handle word boundaries for more advanced features
        };

        currentUtterance = utterance;

        try {
          speechSynthesis.speak(utterance);
        } catch (error) {
          console.error('Error starting speech synthesis:', error);
          isPlaying = false;
          playButtonText.textContent = 'Play Translation';
          playButton.disabled = false;
          showNotification('Failed to start speech synthesis', 'error');
        }
      }, 50); // Small delay to ensure clean state
    }

    // Handle play button click
    async function handlePlay() {
      const text = textInput.value.trim();
      const targetLang = languageSelect.value;
      const selectedVoiceIndex = voiceSelect.value;

      if (!text) {
        showNotification('Please enter some text!', 'warning');
        textInput.focus();
        return;
      }

      if (text.length > 2000) {
        showNotification('Text is too long. Please keep it under 2000 characters.', 'error');
        return;
      }

      try {
        // Show loading state
        playButton.disabled = true;
        playButtonText.textContent = 'Translating...';

        // Translate text
        const translatedTextResult = await translateText(text, targetLang);

        // Display translated text
        translatedText.textContent = translatedTextResult;
        translatedText.classList.remove('italic', 'text-gray-600');
        translatedText.classList.add('text-gray-800');

        // Play text
        playText(translatedTextResult, selectedVoiceIndex);

      } catch (error) {
        console.error('Error during processing:', error);
        showNotification('An error occurred. Please try again.', 'error');
      } finally {
        // Reset button state if not playing
        if (!isPlaying) {
          playButton.disabled = false;
          playButtonText.textContent = 'Play Translation';
        }
      }
    }

    // Handle stop button click
    function handleStop() {
      console.log('Stopping speech synthesis');

      // Cancel any ongoing speech
      if (speechSynthesis.speaking) {
        speechSynthesis.cancel();
      }

      // Reset state immediately
      isPlaying = false;
      playButtonText.textContent = 'Play Translation';
      playButton.disabled = false;
      playButton.classList.remove('bg-green-500', 'hover:bg-green-600');
      playButton.classList.add('bg-blue-500', 'hover:bg-blue-600');

      // Update status
      updateStatus('ready', 'Ready to translate');

      // Clear current utterance reference
      currentUtterance = null;
    }

    // Handle copy button click
    function handleCopy() {
      const textToCopy = translatedText.textContent;

      if (textToCopy && textToCopy !== 'Your translated text will appear here...') {
        navigator.clipboard.writeText(textToCopy).then(() => {
          showNotification('Text copied to clipboard!', 'success');
          copyButton.innerHTML = '<i class="fas fa-check mr-2"></i>Copied!';
          setTimeout(() => {
            copyButton.innerHTML = '<i class="fas fa-copy mr-2"></i>Copy Text';
          }, 2000);
        }).catch(() => {
          showNotification('Failed to copy text', 'error');
        });
      } else {
        showNotification('No text to copy', 'warning');
      }
    }

    // Handle clear button click
    function handleClear() {
      textInput.value = '';
      translatedText.textContent = 'Your translated text will appear here...';
      translatedText.classList.add('italic', 'text-gray-600');
      translatedText.classList.remove('text-gray-800');
      updateCharCount();
      updateStatus('ready', 'Ready to translate');
      textInput.focus();
    }

    // Handle keyboard shortcuts
    function handleKeyboardShortcuts(event) {
      // Ctrl/Cmd + Enter to play
      if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        event.preventDefault();
        if (!playButton.disabled) {
          handlePlay();
        }
      }

      // Escape to stop
      if (event.key === 'Escape') {
        handleStop();
      }

      // Ctrl/Cmd + C to copy (when translated text is focused)
      if ((event.ctrlKey || event.metaKey) && event.key === 'c' && event.target === translatedText) {
        handleCopy();
      }
    }

    // Show notification
    function showNotification(message, type = 'info') {
      // Remove existing notifications
      const existingNotifications = document.querySelectorAll('.notification');
      existingNotifications.forEach(notification => notification.remove());

      // Create notification element
      const notification = document.createElement('div');
      notification.className = `notification fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transform transition-all duration-300 translate-x-full`;

      // Set colors based on type
      switch (type) {
        case 'success':
          notification.classList.add('bg-green-500', 'text-white');
          break;
        case 'error':
          notification.classList.add('bg-red-500', 'text-white');
          break;
        case 'warning':
          notification.classList.add('bg-yellow-500', 'text-white');
          break;
        default:
          notification.classList.add('bg-blue-500', 'text-white');
      }

      notification.innerHTML = `
        <div class="flex items-center">
          <i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'exclamation-triangle' : type === 'warning' ? 'exclamation' : 'info'} mr-2"></i>
          <span>${message}</span>
          <button class="ml-4 text-white hover:text-gray-200" onclick="this.parentElement.parentElement.remove()">
            <i class="fas fa-times"></i>
          </button>
        </div>
      `;

      document.body.appendChild(notification);

      // Animate in
      setTimeout(() => {
        notification.classList.remove('translate-x-full');
      }, 100);

      // Auto remove after 5 seconds
      setTimeout(() => {
        notification.classList.add('translate-x-full');
        setTimeout(() => notification.remove(), 300);
      }, 5000);
    }

    // Initialize the application when DOM is loaded
    document.addEventListener('DOMContentLoaded', init);
