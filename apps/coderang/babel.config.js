module.exports = api => {
  const isTest = api.env('test');
  api.cache(true);
  if (isTest) {
    return {
      presets: [
        '@babel/preset-env',
        '@babel/preset-typescript',
        [
          '@babel/preset-react',
          {
            runtime: 'automatic',
          },
        ],
      ],
      env: {
        test: {
          presets: [['@babel/preset-env', { targets: { node: 'current' } }]],
        },
      },
    };
  }

  return {
    presets: ['next/babel'],
    env: {
      test: {
        plugins: ['dynamic-import-node'],
      },
    },
  };
};
