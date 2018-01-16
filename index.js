const axios = require('axios')
const changeCase = require('change-case')
const fs = require('fs-extra')
const yaml = require('js-yaml')

const generateYaml = (emojis) => {
  const yamlData = yaml.safeDump({
    name: 'Factorio',
    emojis
  })

  fs.writeFile('emoji.yml', yamlData)
    .then(() => (
      console.log('File saved')
    )).catch((err) => (
      console.log('Something went wrong', err)
    ))
}

const getPage = (images = [], aicontinue) => {
  console.log('Fetching page with offset:', aicontinue)

  return axios.get('https://wiki.factorio.com/api.php', {
    params: {
      action: 'query',
      aicontinue,
      aimime: 'image/png',
      aiprop: 'dimensions|url',
      format: 'json',
      list: 'allimages'
    }
  }).then(({ data }) => {
    const nextImages = images.concat(
      data.query.allimages
        .filter(({ width, height }) => (
          width <= 32 && height <= 32
        )).map(({ name, url }) => ({
          name: changeCase.paramCase(name.slice(0, -4)),
          src: url
        }))
    )

    if (data.continue && data.continue.aicontinue) {
      getPage(nextImages, data.continue.aicontinue)
    } else {
      generateYaml(nextImages)
    }
  }).catch((err) => (
    console.log('Error fetching emoji', err)
  ))
}

getPage()
