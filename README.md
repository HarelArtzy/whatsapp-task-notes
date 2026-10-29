# WhatsApp Task Notes

Experimental browser extension that listens for incoming and outgoing WhatsApp Web messages and prepares a task-summary prompt. It uses a small listener based on the event approach in WPPConnect WA-JS (Apache 2.0; see `LICENSE-WA-JS.txt` and https://github.com/wppconnect-team/wa-js). The full WA-JS library is not loaded by the extension.

## Firefox

1. In Firefox 128 or newer, open `about:debugging#/runtime/this-firefox`.
2. Reload the existing temporary extension, or select **Load Temporary Add-on** and choose `firefox/manifest.json`.
3. Reload WhatsApp Web, sign in, and wait until the extension popup says **Listener connected**.

Firefox removes temporary extensions when it closes. Repeat installation after restarting. A permanent installation in standard Firefox requires Mozilla signing.

## Chrome

Open `chrome://extensions`, enable Developer mode, and choose **Load unpacked** with the main project folder. Reload the extension if already installed, then reload WhatsApp Web.

## Use

1. Open one WhatsApp Web tab and wait for **Listener connected**. Leave the tab open and connected.
2. Click **Start day**. The extension attempts to listen for new incoming and outgoing text across chats without automatically opening chats or marking them read.
3. Click **Finish day**. Review messages, click **Copy prompt for Codex**, and paste the result into Codex.
4. Open **Edit summary prompt** to customize the instructions, then select **Save prompt**. Messages and timezone are appended automatically. **Restore default** resets the instructions. Chrome and Firefox store their prompts separately.
5. **Clear all messages** removes stored messages across all days. Use the day selector to review and copy messages from earlier days. Sessions made before this feature are identified by their first saved message time; messages from the original prototype appear as older messages.

## Limits and privacy

- The new listener has not been tested against a live WhatsApp account. Test with harmless messages to an unopened chat and verify that it remains unread. Do not rely on the prototype for confidential work messages until tested.
- This uses undocumented WhatsApp Web internals and can stop working when WhatsApp changes. Listener connected only means the expected message collection was found, not that every message will be captured. WhatsApp Web must stay open and connected. Some messages may be missed, including when disconnected, due to timing, synchronization, timestamp differences, or unsupported message types.
- It excludes old message timestamps; outgoing messages are labeled as yours. Only text or captions are collected; images, audio and documents are not collected themselves. Messages within the same timestamp second as starting can be ambiguous. Chat identifiers may appear instead of names.
- Up to 1,000 messages total are saved in extension storage; older ones are discarded. Data from older versions may remain until cleared. Chrome and Firefox have separate storage. The extension does not encrypt this data.
- The purpose-built listener contains no analytics or network-sending code. The extension copies the current day's text to the clipboard at your request. Pasting it into Codex shares it according to your configuration. WhatsApp itself still uses the network as normal. Follow workplace policies and consider other people's privacy.
- The WA-JS research files are stored separately in Documents/WA-JS Reference; neither browser manifest references the library.
