export class ConfigDB {
  static data = {
    settings: {
      layout_type: 'ltr',
      sidebar: {
        type: 'horizontal-wrapper',
        iconType: 'stroke-svg'
      },
      sidebar_setting: null,
    },
    color: {
      primary_color: '#7366ff', 
      secondary_color: '#f73164',
      mix_background_layout: 'light-only',
    },
    router_animation: 'fadeIn'
  };

  static defaultSettings = {
    ...this.data,
    settings: {
      ...this.data.settings,
      layout_type: localStorage.getItem('layout_type') || this.data.settings.layout_type,
      sidebar: {
        ...this.data.settings.sidebar,
        type: localStorage.getItem('wrapper') || this.data.settings.sidebar.type,
        iconType: localStorage.getItem('icon-type') || this.data.settings.sidebar.iconType,
      },
      sidebar_setting: localStorage.getItem('sidebar_setting') || this.data.settings.sidebar_setting,
      sidebar_backround: localStorage.getItem('sidebar_backround') || this.data.settings.sidebar_backround,
    },
    color: {
      ...this.data.color,
      primary_color: localStorage.getItem('primary_color') || this.data.color.primary_color,
      secondary_color: localStorage.getItem('secondary_color') || this.data.color.secondary_color,
      mix_background_layout: localStorage.getItem('mix_background_layout') || this.data.color.mix_background_layout,
    },
    router_animation: localStorage.getItem('animation') || this.data.router_animation,
  };
}
