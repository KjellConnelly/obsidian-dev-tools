import { App, Notice, Plugin, PluginSettingTab, Setting, ToggleComponent, TFile, TAbstractFile, TextComponent, } from 'obsidian'
import { SettingType, TextOptionType, ToggleOptionType, allSettingComponentTypes,
  allSettingComponentOptionTypes, SettingPackageType } from './types'

export default class ObsidianDevLibrary {
  plugin : any
  containerEl? : HTMLElement


  constructor(plugin : any) {
    this.plugin = plugin
  }

  setContainerElement(containerEl : HTMLElement) {
    this.containerEl = containerEl
    containerEl.empty()
  }

  ///////////////////////
  // PUBLIC
  ///////////////////////
  // Settings can be rendered in HTML, or just plain text. Setting html:true allows html tags to render.

  public simpleAddSetting(options:SettingType, components:Array<allSettingComponentOptionTypes>) : SettingPackageType {
    const setting : Setting = new Setting(this.containerEl)
    const { name, description, html} = options
    if (name) {
      setting.setName(name)
      if (html) {setting.nameEl.innerHTML = name}
    }
    if (description) {
      setting.setDesc(description)
      if (html) {setting.descEl.innerHTML = description}
    }
    console.log(components)
    let componentsToReturn = []
    for (let i = 0; i < components.length; i++) {
      if (components[i] == TextOptionType) {
        componentsToReturn.push(this.addText(settings, components[i]))
      }
    }

    return {setting:setting, components:componentsToReturn}
  }

  public addSettingWithText(options: {
    name?: string,
    description?: string,
    html?: boolean,
    key: string,
    placeholder?: string,
    autoSave?: boolean,
    onChange?: (
      value : string,
      component : TextComponent,
      setting : Setting
    )=>void,
  }) : { setting : Setting, component : TextComponent} {
    const { name, description, html, key, placeholder, autoSave, onChange } = options
    const setting = this.addSetting({name,description,html})
    const component = this.addText(setting, {key,placeholder,autoSave,onChange})
    return {setting, component}
  }

  public addSettingWithToggle(options: {
    name?: string,
    description?: string,
    html?: boolean,
    key: string,
    value?: boolean,
    autoSave?: boolean,
    onChange?: (
      value : boolean,
      component : ToggleComponent,
      setting : Setting
    )=>void,
  }) : { setting : Setting, component : ToggleComponent} {
    const { name, description, html, key, onChange, value, autoSave } = options
    const setting = this.addSetting({name,description,html})
    const component = this.addToggle(setting, {key,onChange,autoSave,value})
    return {setting, component}
  }



  private addSetting(options : {
    name?: string,
    description?: string,
    html?: boolean,
  }) : Setting {
      const setting : Setting = new Setting(this.containerEl)
      const { name, description, html} = options
      if (name) {
        setting.setName(name)
        if (html) {setting.nameEl.innerHTML = name}
      }
      if (description) {
        setting.setDesc(description)
        if (html) {setting.descEl.innerHTML = name}
      }

      return setting
  }

  private addText(setting : Setting, options : {
    key: string,
    placeholder?: string,
    autoSave?: boolean,
    onChange?: (
      value : string,
      element : TextComponent,
      setting : Setting,
    )=>void,
  }) : TextComponent {
    const { placeholder, key, autoSave, onChange, } = options
    let component : TextComponent
    setting.addText((comp: TextComponent)=> {
      component = comp
    	component.setValue(this.plugin.settings[key] || '')
      component.setPlaceholder(placeholder || '')
      component.onChange(async (value : string)=>{
        if (autoSave != false) {
          this.plugin.settings[key] = value
          await this.plugin.saveSettings()
        }
        if (onChange) {
          onChange(value, component, setting)
        }
      })
    })
    return component
  }

  private addToggle(setting: Setting, options : {
    key: string,
    value?: boolean,
    autoSave? : boolean,
    onChange: (
      value : boolean,
      toggle : ToggleComponent,
      setting : Setting
    )=>void,
  }) : ToggleComponent {
    const { key, onChange, autoSave, value } = options
    let component : ToggleComponent
		setting.addToggle((comp : ToggleComponent)=>{
      component = comp
			component.setValue((value != undefined) ? value : this.plugin.settings[key])
			component.onChange(async (value : boolean)=>{
        if (autoSave != false) {
          this.plugin.settings[key] = value
          await this.plugin.saveSettings()
        }
        if (onChange) {
          onChange(value, component, setting)
        }
			})
		})
    return component
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
