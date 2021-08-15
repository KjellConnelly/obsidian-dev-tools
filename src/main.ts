import { Plugin } from 'obsidian'
import ConsoleHelper from './Classes/ConsoleHelper'
import Commands from './Classes/Commands'

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
		new Commands(this)
	}
}
