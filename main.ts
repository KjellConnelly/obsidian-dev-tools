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

	optionalLog(evaluate : boolean = false) {
		let text = ''
    if (window.getSelection) {
      text = window.getSelection().toString();
    }
		if (text.length > 0) {
	    this.consoleHelper[evaluate ? 'logEval' : 'log'](text)
		}
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

		this.addCommand({
			id: 'Obsidian Dev Tools Plugin: console.log() Highlighted Text',
			name: 'console.log() Highlighted Text',
			checkCallback: (checking: boolean) => {
				let leaf = this.app.workspace.activeLeaf
				if (leaf) {
					if (!checking) {
						this.optionalLog(false)
					}
					return true
				}
				return false
			}
		})

		this.addCommand({
			id: 'Obsidian Dev Tools Plugin: console.log(eval) Highlighted Text',
			name: 'console.log(eval) Highlighted Text',
			checkCallback: (checking: boolean) => {
				let leaf = this.app.workspace.activeLeaf
				if (leaf) {
					if (!checking) {
						this.optionalLog(true)
					}
					return true
				}
				return false
			}
		})
	}
}
