const fs = require('fs')
const axios = require('axios')
const moment = require('moment-timezone')
const {
	tools
} = require('./index')
const {
	mylang
} = require('../lang')
const {
	exec
} = require('child_process')

// JSON's & Utilidades
const config = JSON.parse(fs.readFileSync('./lib/config/Settings/config.json'))
const atualyui = JSON.parse(fs.readFileSync('./package.json'))

// Checa por atualizações
exports.checkUpdate = async () => {
	await axios.get('https://raw.githubusercontent.com/KillovSky/yui/dev/package.json').then(last => {
		if (atualyui.version !== last.data.version) {
			console.log(tools('others').color('[UPDATE]', 'crimson'), tools('others').color(`Uma nova versão da Yui foi lançada [${last.data.version}], atualize para obter melhorias e correções! → ${last.data.homepage}`, 'gold')+'\n')
		} else console.log(tools('others').color(`[yui ${atualyui.version}]`, 'magenta'), tools('others').color('Parabéns por manter me manter atualizada <3', 'lime')+'\n')
	}).catch(err => {
		let sessionLog_Name = `./logs/Session_Logs/${moment().format('DD-MM-YY # HH-mm-ss')} - ${tools('others').randomString(5)}.txt`
		console.log(`Checagem de versão falhou, de uma olhada no arquivo de Logs -> ${sessionLog_Name}`)
		fs.appendFileSync(sessionLog_Name, err)
	})
}

// Verifica se a pessoa desligou a Yui com segurança
exports.safeBoot = async () => {
	if (config.SafeBoot == true) {
		config.SafeBoot = false
		fs.writeFileSync('./lib/config/Settings/config.json', JSON.stringify(config, null, "\t"))
	} else {
		let sBMess = mylang(config.Language).badshtd()
		console.log(tools('others').color('[Yui 🙂]', 'magenta'), tools('others').color(sBMess.join(' | '), 'lime')+'\n') // Pula linha no terminal
		if (config.Popup) {
			for (let i = 0; i < sBMess.length; i++) {
				await tools('others').sleep(5000)
				tools('others').notify('Yui', sBMess[i], `./lib/media/img/${i}.png`)
			}
		}
	}
}
// Sistema de Transmissão de Emergência com atraso de 1 hora para evitar sobrecarga, básico mas funcional
exports.transmission = async () => {
	try {
		if (config.Enable_EAS) {
			let broadCast = ''
			var notError = true
			const getTransmission = async () => {
				if (notError) {
					axios.get("https://pastebin.com/raw/mhDCmszg").then(async (govMess) => {
						if (broadCast !== govMess.data) {
							broadCast = govMess.data
							if (config.Language == 'pt') {
								console.log(tools('others').color('[KILLOVSKY]', 'magenta'), tools('others').color(govMess.data, 'lime')+'\n')
								if (config.Popup) {
									tools('others').notify('KILLOVSKY', govMess.data, './lib/media/img/kill.png')
								}
							} else {
								let msgTra = await tools('others').translate(govMess.data)
								console.log(tools('others').color('[KILLOVSKY]', 'magenta'), tools('others').color(msg, 'lime')+'\n')
								if (config.Popup) {
									tools('others').notify('KILLOVSKY', msg, './lib/media/img/kill.png')
								}
							}
						}
					}).catch(err => {
						// Desativa a transmissão pra evitar mais erros ao decorrer do runtime
						config.Enable_EAS = false
						fs.writeFileSync('./lib/config/Settings/config.json', JSON.stringify(config, null, "\t"))
						notError = false
						console.log(err.message)
					})
					await tools('others').sleep(3600000) /* Adquire informações transmitidas por mim de 1 em 1 hora */
					getTransmission()
				}
			}
			getTransmission()
		}
	} catch (error) {
		// Desativa a transmissão pra evitar mais erros ao decorrer do runtime
		config.Enable_EAS = false
		fs.writeFileSync('./lib/config/Settings/config.json', JSON.stringify(config, null, "\t"))
		console.log(error.message)
	}
}

// Faz backups periódicos durante a execução
exports.backup = async () => {
	try {
		if (config.Enable_Backups) {
			let backMess = mylang(config.Language).bkpfinish()
			console.log(tools('others').color('[Yui 🙂]', 'magenta'), tools('others').color(backMess.join(' | '), 'lime')+'\n')
			if (config.Popup) {
				for (let i of backMess) {
					await tools('others').sleep(5000)
					tools('others').notify('Yui', i, `./lib/media/img/3.png`)
				}
			}
			const makeBackup = async () => {
				exec(`bash -c 'zip -r "lib/config/Backups/${moment().format('DD-MM-YY # HH-mm-ss')}.zip" lib/config -x "*lib/config/Utilidades*" -x "*lib/config/Backups*"'`, (err) => {
					if (err) return console.log(tools('others').color(`[BACKUP]`, 'crimson'), tools('others').color(`→ O Backup obteve uns problemas mas você pode ignorar - ou não. → "${err.message}"`, 'gold')+'\n')
					console.log(tools('others').color(`[BACKUP]`, 'crimson'), tools('others').color(`→ O Backup periódico foi concluído com sucesso!`, 'gold')+'\n')
				})
				await tools('others').sleep(3600000) /* Refaz a função a cada 1 hora */
				makeBackup()
			}
			makeBackup()
		}
	} catch (err) {
		console.log(error.message)
	}
}