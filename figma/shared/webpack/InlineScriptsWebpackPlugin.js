class InlineScriptsWebpackPlugin {
  constructor(options = {}) {
    this.htmlWebpackPlugin = options.htmlWebpackPlugin;
    this.tests = options.tests ?? [];
  }

  matches(assetName) {
    return this.tests.some((test) => test.test(assetName));
  }

  normalizeAssetName(src, publicPath) {
    if (!src) {
      return src;
    }

    if (publicPath && src.startsWith(publicPath)) {
      return src.slice(publicPath.length);
    }

    return src.replace(/^\//, '');
  }

  inlineTag(compilation, publicPath, tag) {
    if (tag.tagName !== 'script' || !tag.attributes?.src) {
      return tag;
    }

    const assetName = this.normalizeAssetName(tag.attributes.src, publicPath);

    if (!assetName || !this.matches(assetName)) {
      return tag;
    }

    const asset = compilation.getAsset(assetName);

    if (!asset) {
      return tag;
    }

    return {
      tagName: 'script',
      voidTag: false,
      meta: tag.meta,
      attributes: {
        ...(tag.attributes.type ? { type: tag.attributes.type } : {}),
      },
      innerHTML: asset.source.source().toString(),
    };
  }

  apply(compiler) {
    if (!this.htmlWebpackPlugin) {
      throw new Error('InlineScriptsWebpackPlugin requires the HtmlWebpackPlugin constructor.');
    }

    compiler.hooks.compilation.tap('InlineScriptsWebpackPlugin', (compilation) => {
      this.htmlWebpackPlugin.getHooks(compilation).alterAssetTagGroups.tap(
        'InlineScriptsWebpackPlugin',
        (data) => {
          data.headTags = data.headTags.map((tag) => this.inlineTag(compilation, data.publicPath, tag));
          data.bodyTags = data.bodyTags.map((tag) => this.inlineTag(compilation, data.publicPath, tag));
          return data;
        },
      );
    });
  }
}

module.exports = InlineScriptsWebpackPlugin;
