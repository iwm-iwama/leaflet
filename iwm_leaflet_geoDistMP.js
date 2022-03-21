// > node iwm_leaflet_geoDistMP.js [入力ファイル]

const path = require("path");
const fs = require("fs");

const Cmd = path.basename(process.argv[1]);
const IFn = process.argv[2];

if (!IFn || !fs.existsSync(IFn)) {
	console.log();
	console.log(`\u001b[0;97;104m iwm_leaflet.html が出力したTSVファイルから総延長／区間距離を計算 \u001b[0;99m`);
	console.log();
	console.log(`\u001b[0;97;101m node ${Cmd} [File] \u001b[0;99m`);
	console.log();
	console.log(`\u001b[0;95m(例)\u001b[0;97m node ${Cmd} ./マーカー変換.tsv`);
	console.log();
	console.log(`\u001b[0;96m※十進法 ddd.d...`);
	console.log(`\u001b[0;93m(入力)\u001b[0;97m`);
	console.log(`  // 北緯	東経	場所`);
	console.log(`  35.685187	139.752274	皇居`);
	console.log(`  24.449582	122.934340	日本最西端之地`);
	console.log(`\u001b[0;99m`);
	return;
}

//-------------------------------
// Vincenty法による２点間の距離
//-------------------------------
function rtnGeoVincentry(
	$lat1, // 始点～北緯
	$lng1, // 始点～東経
	$lat2, // 終点～北緯
	$lng2  // 終点～東経
) {
	if ($lat1 == $lat2 && $lng1 == $lng2) {
		return [0.0, 0.0];
	}

	/// const A = 6378137.0;
	const _B = 6356752.314140356;      // GRS80
	const _F = 0.003352810681182319;   // 1 / 298.257222101
	const _RAD = 0.017453292519943295; // π / 180

	$lat1 = parseFloat($lat1) * _RAD;
	$lng1 = parseFloat($lng1) * _RAD;
	$lat2 = parseFloat($lat2) * _RAD;
	$lng2 = parseFloat($lng2) * _RAD;

	const f1 = 1 - _F;
	const omega = $lng2 - $lng1;
	const tanU1 = f1 * Math.tan($lat1);
	const cosU1 = 1 / Math.sqrt(1 + tanU1 * tanU1);
	const sinU1 = tanU1 * cosU1;
	const tanU2 = f1 * Math.tan($lat2);
	const cosU2 = 1 / Math.sqrt(1 + tanU2 * tanU2);
	const sinU2 = tanU2 * cosU2;

	let lamda = omega;
	let dLamda = 0;
	let sinLamda = 0.0;
	let cosLamda = 0.0;
	let sin2Sigma = 0.0;
	let sinSigma = 0.0;
	let cosSigma = 0.0;
	let sigma = 0.0;
	let sinAlpha = 0.0;
	let cos2Alpha = 0.0;
	let cos2sm = 0.0;
	let c = 0.0;

	while (true) {
		sinLamda = Math.sin(lamda);
		cosLamda = Math.cos(lamda);
		sin2Sigma = cosU2 * sinLamda * (cosU2 * sinLamda) + (cosU1 * sinU2 - sinU1 * cosU2 * cosLamda) * (cosU1 * sinU2 - sinU1 * cosU2 * cosLamda);
		if (sin2Sigma < 0) {
			return [0.0, 0.0];
		}
		sinSigma = Math.sqrt(sin2Sigma);
		cosSigma = sinU1 * sinU2 + cosU1 * cosU2 * cosLamda;
		sigma = Math.atan2(sinSigma, cosSigma);
		sinAlpha = (cosU1 * cosU2 * sinLamda) / sinSigma;
		cos2Alpha = 1 - sinAlpha * sinAlpha;
		cos2sm = cosSigma - (2 * sinU1 * sinU2) / cos2Alpha;
		c = (_F / 16) * cos2Alpha * (4 + _F * (4 - 3 * cos2Alpha));
		dLamda = lamda;
		lamda = omega + (1 - c) * _F * sinAlpha * (sigma + c * sinSigma * (cos2sm + c * cosSigma * (-1 + 2 * cos2sm * cos2sm)));
		if (Math.abs(lamda - dLamda) <= 1e-12) {
			break;
		}
	}

	let d2 = (cos2Alpha * (1 - f1 * f1)) / (f1 * f1);
	let a = 1 + (d2 / 16384) * (4096 + d2 * (-768 + d2 * (320 - 175 * d2)));
	let b = (d2 / 1024) * (256 + d2 * (-128 + d2 * (74 - 47 * d2)));
	let dSigma = b * sinSigma * (cos2sm + (b / 4) * (cosSigma * (-1 + 2 * cos2sm * cos2sm) - (b / 6) * cos2sm * (-3 + 4 * sinSigma * sinSigma) * (-3 + 4 * cos2sm * cos2sm)));
	let km = (_B * a * (sigma - dSigma)) / 1000; // m => km
	let bearing = Math.atan2(cosU2 * sinLamda, cosU1 * sinU2 - sinU1 * cosU2 * cosLamda) * 57.29577951308232;

	// 変換
	if (bearing < 0) {
		bearing += 360.0; // 度
	}

	return [km, bearing];
}

//-------
// Main
//-------
const Splitter = /[,\t]/;
const Separater = "\t";

const Data1 = fs.readFileSync(IFn, "utf-8");

//---------------------
// 緯度・経度チェック
//---------------------
function rtnIsDecimal(
	...aStr
) {
	for (let _s1 of aStr) {
		if (_s1.match(/^[\+\-]{0,1}[0-9]+\.{0,1}[0-9]*$/)) {
			return true;
		}
		return false;
	}
}

//---------------
// 計算／十進法
//---------------
function main_Data(
	sData
) {
	let iTotalDist = 0.0;
	let aOld = [];

	// 距離計算
	for (let _s1 of sData.split("\n")) {
		_s1 = _s1.trim();
		const _a1 = _s1.split(Splitter);

		// 厳密チェック
		if (rtnIsDecimal(_a1[0], _a1[1])) {
			const [dist, angle] = (
				aOld[0] ?
					rtnGeoVincentry(aOld[0], aOld[1], _a1[0], _a1[1]) :
					[0.0, 0.0]
			);

			let str = `${dist.toFixed(6)}km${Separater}${angle.toFixed(6)}度`;

			for (let _s2 of _a1) {
				str += Separater + _s2;
			}
			console.log(str);

			iTotalDist += dist;
			aOld = _a1;
		}
	}

	console.log("%skm", iTotalDist.toFixed(6));
}

//-------------------------
// 入力データ整合チェック
//-------------------------
function main_DataChecker(
	sData
) {
	let iLine = 0;
	let sErr = "";

	for (let _s1 of sData.split("\n")) {
		_s1 = _s1.trim();

		iLine += 1;

		if (_s1.length > 0 && _s1.substr(0, 2) != "//") {
			const _a1 = _s1.split(Splitter);

			if (!rtnIsDecimal(_a1[0], _a1[1])) {
				sErr += `\u001b[0;97mL${iLine}\t${_s1}\n`;
				sErr += `\u001b[0;94m\t>> コメント行にするときは行先頭に\"//\"を付与\n`;
			}
		}
	}

	if (sErr.length > 0) {
		console.error("\n\u001b[0;91m>> Error Data?\n%s\n\u001b[0;99m", sErr);
	}
}

//-------
// Exec
//-------
main_Data(Data1);
main_DataChecker(Data1);
