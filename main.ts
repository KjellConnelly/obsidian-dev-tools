import { Plugin } from 'obsidian'
import ConsoleHelper from './Classes/ConsoleHelper'

interface MyPluginSettings {
	consoleOn: boolean,
}
const DEFAULT_SETTINGS: MyPluginSettings = {
	consoleOn: false,
}

export default class ObsidianDevTools extends Plugin {
  settings: MyPluginSettings
	consoleHelper: ConsoleHelper

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData())
	}

	async saveSettings() {
		await this.saveData(this.settings)
	}

  async onload() {
    await this.loadSettings()
		this.consoleHelper = new ConsoleHelper(this.settings.consoleOn)
    this.addCommand({
			id: 'Obsidian Dev Tools Plugin: Toggle Console',
			name: 'Toggle Console',
			checkCallback: (checking: boolean) => {
				let leaf = this.app.workspace.activeLeaf
				if (leaf) {
					if (!checking) {
						this.consoleHelper.toggle(!this.settings.consoleOn)
						this.settings.consoleOn = !this.settings.consoleOn
						this.saveSettings()
					}
					return true
				}
				return false
			}
		})
  }
}
