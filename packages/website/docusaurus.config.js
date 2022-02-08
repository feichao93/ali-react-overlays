const path = require('path');

module.exports = {
  title: 'ali-react-overlays',
  url: 'https://rexsite.alibaba-inc.com',
  baseUrl: '/ali-react-overlays/',
  onBrokenLinks: 'warn',
  organizationName: 'shinima',
  projectName: 'ali-react-overlays',
  trailingSlash: true,

  themeConfig: {
    navbar: {
      hideOnScroll: true,
      title: 'ali-react-overlays',
      items: [
        {
          href: 'https://github.com/shinima/ali-react-overlays',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
  },

  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          routeBasePath: '/',
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl: 'https://github.com/shinima/ali-react-overlays/edit/master/packages/website/',
        },
        theme: {
          customCss: [path.resolve(__dirname, './src/css/custom.scss')],
        },
      },
    ],
  ],
  themes: ['@docusaurus/theme-live-codeblock'],
  plugins: [path.resolve(__dirname, 'configureWebpack.js'), 'docusaurus-plugin-sass'],
};
