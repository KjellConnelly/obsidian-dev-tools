import { App, Notice, Plugin, PluginSettingTab, Setting, ToggleComponent, TFile, TAbstractFile, TextComponent, } from 'obsidian'

export default class ObsidianDevLibrary {
  plugin : any
  containerEl? : HTMLElement


  constructor(plugin : any) {
    this.plugin = plugin
  }

  setContainerElement(containerEl : HTMLElement) {
    this.containerEl = containerEl
  }

  // Settings can be rendered in HTML, or just plain text. Setting html:true allows html tags to render.
  addSetting(options : {
    name?: string,
    description?: string,
    html?: boolean
  } = {
    html:true
  }) : Promise<Setting> {
    return new Promise((resolve, reject)=>{
      const setting = new Setting(this.containerEl)
      const { name, description, html} = options
      if (name) {
        setting.setName(name)
        if (html) {setting.nameEl.innerHTML = name}
      }
      if (description) {
        setting.setDesc(description)
        if (html) {setting.descEl.innerHTML = name}
      }
      resolve(setting)
    })
  }

  addTextInputSetting(setting : Setting, options : {
    key: string,
    placeholder?: string,
    autoSave?: boolean,
    onChange?: (
      value : string,
      element : TextComponent,
    )=>void,
  }) : Promise<TextComponent> {
    return new Promise((resolve, reject)=>{
      try {
        const { placeholder, key, autoSave, onChange, } = options

        setting.addText((component: TextComponent)=> {
          const startingString = `${this.plugin.settings[key]}`
    			component.setValue(startingString)
      			.onChange(async (value : string)=>{
              if (autoSave) {
                this.plugin.settings[key] = value
      				  await this.plugin.saveSettings()
              }
              if (onChange) {
                onChange(value, component)
              }
      			})
            resolve(component)
    		})
      } catch(err) {
        reject(err)
      }
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
