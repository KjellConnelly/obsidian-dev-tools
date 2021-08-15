import type { App, Editor, Plugin, View } from 'obsidian';
import type ObsidianDevTools from './../main'

class CommandsHelper {
  private readonly plugin: ObsidianDevTools

  constructor(plugin: ObsidianDevTools) {
    this.plugin = plugin
  }
//,cb:()=>void;
  public addCommand({id,name,cb} : {id:string,name:string,cb:()=>void}) {
    this.plugin.addCommand({
			id: id,
			name: name,
			checkCallback: (checking: boolean) => {
				let leaf = this.plugin.app.workspace.activeLeaf
				if (leaf) {
					if (!checking) {
						cb()
					}
					return true
				}
				return false
			}
		})
  }
}

export default class Commands {
  private readonly plugin: ObsidianDevTools;
  private readonly commandsHelper: CommandsHelper;

  constructor(plugin : ObsidianDevTools) {
    this.plugin = plugin
    this.commandsHelper = new CommandsHelper(plugin)
    this.load_toggleConsole()
    this.load_logHighlightedText()
    this.load_evalHighlightedText()
  }

  private load_toggleConsole() {
    const {plugin, commandsHelper} = this
    commandsHelper.addCommand({
      id: 'Obsidian Dev Tools Plugin: Toggle Console',
			name: 'Toggle Console',
      cb: ()=>{
        plugin.consoleHelper.toggle(!this.plugin.settings.consoleOn)
        plugin.settings.consoleOn = !this.plugin.settings.consoleOn
        plugin.saveSettings()
      }
    })
  }

  private load_logHighlightedText() {
    const {plugin, commandsHelper} = this
    commandsHelper.addCommand({
      id: 'Obsidian Dev Tools Plugin: console.log() Highlighted Text',
			name: 'console.log() Highlighted Text',
      cb: ()=>{
        plugin.optionalLog(false)
      }
    })
  }

  private load_evalHighlightedText() {
    const {plugin, commandsHelper} = this
    commandsHelper.addCommand({
      id: 'Obsidian Dev Tools Plugin: console.log(eval) Highlighted Text',
			name: 'console.log(eval) Highlighted Text',
      cb: ()=>{
        plugin.optionalLog(true)
      }
    })
  }
}
