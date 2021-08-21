import { PluginSettingTab, Setting, Notice } from 'obsidian'
import type ObsidianDevToolsPlugin from './../main'
import ObsidianDevShortcuts from './ObsidianDevShortcuts'
import ObsidianDevLibrary from '../../../src/lib/ObsidianDevLibrary'
import icons from './../data/icons'

export default class SettingsTab extends PluginSettingTab {
  private readonly plugin: ObsidianDevToolsPlugin
  private readonly shortcuts: ObsidianDevShortcuts

  constructor(plugin : ObsidianDevToolsPlugin) {
    super(plugin.app, plugin)
    this.plugin = plugin
    this.shortcuts = new ObsidianDevShortcuts(plugin)
  }


  public display(): void {
    const { devLibrary, settings } = this.plugin
    devLibrary.setContainerElement(this.containerEl)
    const setting1 = devLibrary.addSettingWithText({
      name:"New Setting",
      key:"New Setting Key",
      placeholder:"This is a placeholder"
    })
    const setting2 = devLibrary.addSettingWithToggle({
      name:"Today's Daily Note Decal",
      description:settings.todayDecalOn ? 'Decal Added to Navigator' : 'Decal Disabled on Navigator',
      key:'todayDecalOn',
      onChange:(value, toggle, setting)=>{
        setting.setDesc(value ? 'Decal Added to Navigator' : 'Decal Disabled on Navigator')
      }
    })
  }
}


/*
const { containerEl } = this
  		containerEl.empty()
      const {settings, devLibrary} = this.plugin

  		containerEl.createEl('h1', {text: 'Dev Tools Settings'})

  		containerEl.createEl('h2', {text: "Console"})

      const setting1 = await devLibrary.addSetting({name:"My Name!"})
      const setting1_textElement = await devLibrary.addTextInputSetting(setting1, {
        key:"TestKey",
        placeholder:"My Placeholder!"
      })




      this.shortcuts.addTextInputSetting({
  			containerEl:containerEl,
  			name:`Startup console height (need to restart Obsidian to take see changes):`,
  			description:`${settings.consoleHeight}px`,
  			placeholder:`${this.plugin.defaultSettings.consoleHeight} (default)`,
  			key:'consoleHeight',
        autoSetValue:false,
        onChange:(async (text, textElement, settingElement)=>{
          const textToNumber = this.shortcuts.isNumberGetNumber(text.trim())
          if (textToNumber != null) {
            settings.consoleHeight = textToNumber
            await this.plugin.saveSettings()
            setTimeout(()=>{
              settingElement.setDesc(`${settings.consoleHeight}px`)
            }, 1)
          } else {
            setTimeout(()=>{
              if (text == '') {
                settingElement.setDesc(`Invalid height. Height set to ${this.plugin.defaultSettings.consoleHeight}px`)
              } else {
                settingElement.setDesc(`${settings.consoleHeight}px`)
              }
            }, 1)
          }
        })
  		})
      containerEl.createEl('h2', {text: "Native Icons to View"})
      for (let i = 0; i < icons.length; i++) {
        new Setting(containerEl).setDesc(icons[i]).addButton(btn=>{
          btn.setIcon(icons[i])
          btn.onClick(e=>{
            navigator.clipboard.writeText(icons[i])
            new Notice(`${icons[i]} copied to clipboard`);
          })
        })
      }


*/






      /*
  		shortcuts.addToggleInputSetting({
  			containerEl:containerEl,
  			name:"Today's Daily Note Decal",
  			description:todayDecalOn ? 'Decal Added to Navigator' : 'Decal Disabled on Navigator',
  			key:'todayDecalOn',
  			onChange:(val, toggle, setting)=>{
  				setting.setDesc(todayDecalOn ? 'Decal Added to Navigator' : 'Decal Disabled on Navigator')
  			}
  		})

  		shortcuts.addTextInputSetting({
  			containerEl:containerEl,
  			name:'Decal Text',
  			description:'Set text or html element for your decal',
  			placeholder:'Default: *',
  			key:'decalText',
  		})




  		containerEl.createEl('h2', {text: "Creating Events"})
  		shortcuts.addTextInputSetting({
  			containerEl:containerEl,
  			name:`JSON Directory (Obsidian doesn't see .json files)`,
  			description:'Where do you want your event files saved? Note: If you change this, you will need to manually move files before you run a new command which accesses this directory. By default, this is in your config directory, which is in a hidden folder.',
  			placeholder:'.obsidian/.daily-manager',
  			key:'jsonDirectory',
  		})
      */
