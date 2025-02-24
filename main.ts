import {
	App,
	Editor,
	MarkdownView,
	Modal,
	Notice,
	Plugin,
	PluginSettingTab,
	Setting,
} from "obsidian";

// Remember to rename these classes and interfaces!

interface MyPluginSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: "default",
};

export default class PhotoScan extends Plugin {
	settings: MyPluginSettings;

	async onload() {
		await this.loadSettings();

		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon(
			"dice",
			"Sample Plugin",
			(evt: MouseEvent) => {
				// Called when the user clicks the icon.
				new Notice("This is a notice!");
				new SampleModal(this.app).open();
			}
		);
		// Perform additional things with the ribbon
		ribbonIconEl.addClass("my-plugin-ribbon-class");

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText("Status Bar Text");

		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: "open-sample-modal-simple",
			name: "Open sample modal (simple)",
			callback: () => {
				new SampleModal(this.app).open();
			},
		});
		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: "sample-editor-command",
			name: "Sample editor command",
			editorCallback: (editor: Editor, view: MarkdownView) => {
				console.log(editor.getSelection());
				editor.replaceSelection("Sample Editor Command");
			},
		});
		// This adds a complex command that can check whether the current state of the app allows execution of the command
		this.addCommand({
			id: "open-sample-modal-complex",
			name: "Open sample modal (complex)",
			checkCallback: (checking: boolean) => {
				// Conditions to check
				const markdownView =
					this.app.workspace.getActiveViewOfType(MarkdownView);
				if (markdownView) {
					// If checking is true, we're simply "checking" if the command can be run.
					// If checking is false, then we want to actually perform the operation.
					if (!checking) {
						new SampleModal(this.app).open();
					}

					// This command will only show up in Command Palette when the check function returns true
					return true;
				}
			},
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class SampleModal extends Modal {
	image: string;
	filePicker = document.createElement("input");

	constructor(app: App) {
		super(app);
		this.setTitle("Sample Modal");

		new Setting(this.contentEl).setName("Setting #1").addButton((button) =>
			button.setButtonText("Click Me").onClick(() => {
				this.filePicker.type = "file";
				this.filePicker.accept = "image/*";
				this.filePicker.onchange = (event: Event) => {
					const input = event.target as HTMLInputElement;
					if (input.files && input.files.length > 0) {
						const file = input.files[0];
						new Notice(`Selected file: ${file.name}`);

						const reader = new FileReader();
						reader.onload = (e) => {
							const img = document.createElement("img");
							img.src = e.target?.result as string;
							this.image = e.target?.result as string;
							img.style.maxWidth = "75%";
							imagePlaceholder.innerHTML = "";
							imagePlaceholder.appendChild(img);
						};
						reader.readAsDataURL(file);
					}
				};
				this.filePicker.click();
			})
		);

		const imagePlaceholder = document.createElement("div");
		imagePlaceholder.style.width = "100%";
		imagePlaceholder.style.minHeight = "220px";
		imagePlaceholder.style.border = "1px dashed #ccc";
		imagePlaceholder.style.display = "flex";
		imagePlaceholder.style.alignItems = "center";
		imagePlaceholder.style.justifyContent = "center";
		imagePlaceholder.innerText = "Image will be displayed here";
		this.contentEl.appendChild(imagePlaceholder);

		new Setting(this.contentEl)
			.setName("Setting #2")
			.addButton((button) =>
				button.setButtonText("Save").onClick(() => {
					new Notice(`Image saved: ${this.image}`);
				})
			)
			.setDisabled(true);
	}
}

class SampleSettingTab extends PluginSettingTab {
	plugin: PhotoScan;

	constructor(app: App, plugin: PhotoScan) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName("Setting #1")
			.setDesc("It's a secret")
			.addText((text) =>
				text
					.setPlaceholder("Enter your secret")
					.setValue(this.plugin.settings.mySetting)
					.onChange(async (value) => {
						this.plugin.settings.mySetting = value;
						await this.plugin.saveSettings();
					})
			);
	}
}
