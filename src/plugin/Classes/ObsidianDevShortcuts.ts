import { App, Notice, Plugin, PluginSettingTab, Setting, ToggleComponent, TFile, TAbstractFile, TextComponent, } from 'obsidian'
import type ObsidianDevToolsPlugin from './../main'

export default class ObsidianDevShortcuts {
  plugin : ObsidianDevToolsPlugin

  constructor(plugin : ObsidianDevToolsPlugin) {
    this.plugin = plugin
  }

  addTextInputSetting({
    containerEl = undefined,
    name = ``,
    description = ``,
    placeholder = ``,
    key = ``,
    autoSetValue = true,
    onChange = ()=>{},
  } : {
    containerEl : HTMLElement,
    name: string,
    description: string,
    placeholder: string,
    key: string,
    autoSetValue: boolean,
    onChange: (value : string, textElement : TextComponent, setting : Setting)=>void,
  }) {
    const setting = new Setting(containerEl)
    if (name.length > 0) { setting.setName(name) }
    if (description.length > 0) { setting.setDesc(description) }

		setting.addText((textElement : TextComponent)=> {
			if (placeholder.length > 0) { textElement.setPlaceholder(placeholder) }
      const startingString = `${this.plugin.settings[key]}`
			textElement.setValue(startingString)
			textElement.onChange(async val=>{
        if (autoSetValue) {
          this.plugin.settings[key] = val
				  await this.plugin.saveSettings()
        }
        if (onChange) {
          onChange(val, textElement, setting)
        }
			})
		})
  }

  addToggleInputSetting({
    containerEl = undefined,
    name = ``,
    description = ``,
    key = ``,
    onChange = ()=>{},
  } : {
    containerEl : HTMLElement,
    name: string,
    description: string,
    placeholder: string,
    key: string,
    autoSetValue: boolean,
    onChange: (value : boolean, toggle : ToggleComponent, setting : Setting)=>void,
  }) {
    const setting = new Setting(containerEl)
    if (name.length > 0) { setting.setName(name) }
    if (description.length > 0) { setting.setDesc(description) }

		setting.addToggle(toggle=>{
			toggle.setValue(this.plugin.settings[key])
			toggle.onChange(async val=>{
				this.plugin.settings[key] = val
				await this.plugin.saveSettings()
        if (onChange) {
          onChange(val, toggle, setting)
        }
			})
		})
  }

  isNumberGetNumber(value: string): number | null {
    const isNumber = ((value != null) && (value !== '') && !isNaN(Number(value.toString())))
    return isNumber ? Number(value) : null
  }






  /*
  const decalToggle = new Setting(containerEl)
  decalToggle.setName("Today's Daily Note Decal")
    .setDesc(todayDecalOn ? 'Decal Added to Navigator' : 'Decal Disabled')
    .addToggle(toggle => {
      toggle.setValue(todayDecalOn)
      toggle.onChange(async isOn => {
        decalToggle.setDesc(isOn ? 'Decal Added to Navigator' : 'Decal Disabled')
        this.plugin.settings.todayDecalOn = isOn
        await this.plugin.saveSettings()
      })
    })
  */
}
