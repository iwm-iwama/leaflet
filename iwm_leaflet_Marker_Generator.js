// > node iwm_leaflet_Marker_Generator.js [入力ファイル]

const path = require('path');
const fs = require('fs');

const Cmd = path.basename(process.argv[1]);
const IFn = process.argv[2];

if(! IFn || ! fs.existsSync(IFn))
{
	console.log();
	console.log(`\u001b[0;97;104m 先頭行がラベル（北緯,東経,...）のCSV／TSVファイルから \u001b[0;99m`);
	console.log(`\u001b[0;97;104m iwm_leaflet.html のマーカーを生成                     \u001b[0;99m`);
	console.log();
	console.log(`\u001b[0;97;101m node ${Cmd} [File] \u001b[0;99m`);
	console.log();
	console.log(`\u001b[0;95m(例)\u001b[0;97m node ${Cmd} ./基本基準点.csv`);
	console.log();
	console.log(`\u001b[0;96m※十進法 ddd.d...`);
	console.log(`\u001b[0;93m(入力)\u001b[0;97m`);
	console.log(`  北緯,東経,場所`);
	console.log(`  35.685187,139.752274,皇居`);
	console.log(`\u001b[0;93m(出力)\u001b[0;97m`);
	console.log(`  35.685187	139.752274	<font color=\"#ff5858\">皇居</font>	<font color=\"#3d7cce\">北緯</font>35度41分6.673200秒／35.685187度	<font color=\"#3d7cce\">東経</font>139度45分8.186400秒／139.752274度`);
	console.log(`\u001b[0;99m`);
	return;
}

//-------------------
// 十進法 => 度分秒
//-------------------
function
rtnGeo10toIBL(
	$angle // 十進法
)
{
	$angle = parseFloat($angle);

	let sign = 1;

	if($angle < 0)
	{
		sign = -1;
		$angle = -$angle;
	}

	const deg = parseInt($angle, 10);
		$angle = ($angle - deg) * 60.0;
	let min = parseInt($angle, 10);
		$angle -= min;
	let sec = parseFloat($angle) * 60.0;

	// 0.999... * 60 => 60.0 対策
	if(sec == 60.0)
	{
		min += 1;
		sec = 0;
	}

	return [parseInt(deg, 10) * sign, parseInt(min, 10), parseFloat(sec)];
}

//-------
// Main
//-------
const Splitter = /[,\t]/;
const Separater = "\t";

function
main()
{
	let aTag = [];
	let iLine = 0;
	let sErr = "";

	const IFn = process.argv[2];

	if(fs.existsSync(IFn))
	{
		for(let _s1 of fs.readFileSync(IFn, "utf-8").split("\n"))
		{
			_s1 = _s1.trim();

			let str = "";

			if(_s1.length > 0 && _s1.substr(0, 2) != "//")
			{
				// 入力フォーマット CSV, TSV に対応
				const _a1 = _s1.split(Splitter);

				iLine += 1;

				// １行目はラベル
				if(iLine == 1)
				{
					if(_s1.match(/^[+-]*\d/))
					{
						sErr += `\u001b[0;93mL${iLine}\t\u001b[0;97m${_s1}\n`;
						sErr += `\u001b[0;95m\t>> ラベル名の先頭に数字は使えない ×'0ラベル名' ○'ラベル名0'\n`;
					}
					else
					{
						aTag = _a1;
					}
				}
				// ２行目以降はデータ
				else
				{
					// [0]北緯, [1]東経 を付与
					str += _a1[0] + Separater + _a1[1];

					// [2] のタグを生成
					str += `${Separater}<font color=\"#ff5858\">${_a1[2]}</font>`;

					// [2] 以外のタグを生成
					let _idx = 0;
					for(let _s2 of _a1)
					{
						if(_idx != 2)
						{
							str += Separater;

							if(aTag[_idx])
							{
								str += `<font color=\"#3d7cce\">${aTag[_idx]}</font>`;
							}

							if(_idx < 2)
							{
								const [deg, min, sec] = rtnGeo10toIBL(_a1[_idx]);
								str += `${deg}度${min}分${sec.toFixed(6)}秒／${parseFloat(_a1[_idx]).toFixed(6)}度`;
							}
							else
							{
								str += _s2;
							}
						}
						_idx += 1;
					}
					console.log(str);
				}
			}
		}

		if(sErr.length > 0)
		{
			console.error("\n\u001b[0;91m>> Error Data?\n%s\n\u001b[0;99m", sErr);
		}
	}
}

//-------
// Exec
//-------
main();
