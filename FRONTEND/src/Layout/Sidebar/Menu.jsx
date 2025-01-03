export const MENUITEMS = [
  {
    menutitle: "General",
    menucontent: "Dashboards",
    Items: [
      {
        path: `${process.env.PUBLIC_URL}/dashboard/default`,
        icon: "home",
        title: "Dashboard",
        type: "link",
      },
      {
        path: `${process.env.PUBLIC_URL}/app/analytics`,
        icon: "widget",
        title: "Analytics",
        type: "link",
      },
      {
        path: `${process.env.PUBLIC_URL}/app/report`,
        icon: "task",
        title: "Reports",
        type: "link",
      },
      {
        path: `${process.env.PUBLIC_URL}/app/pos`,
        icon: "ecommerce",
        title: "Point of Sale",
        type: "link",
      },
      {
        path: `${process.env.PUBLIC_URL}/app/settings`,
        icon: "editors",
        title: "Admin Settings",
        type: "link",
      },
    ],
  },
];
