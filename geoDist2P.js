// > node geoDist2P.js

//--------------------------------------------------------------------
// [北緯1]	[東経1]	[北緯2]	[東経2]	[その他]
//--------------------------------------------------------------------
// 十進法 ddd.d...
//--------------------------------------------------------------------
const Data1 = `
35.685187	139.752274	45.416799	141.677155	皇居～稚内駅
35.685187	139.752274	43.385277	145.816641	皇居～納沙布岬
35.685187	139.752274	43.068637	141.350784	皇居～札幌駅
35.685187	139.752274	40.830242	140.734370	皇居～青森駅
35.685187	139.752274	39.701607	141.136465	皇居～盛岡駅
35.685187	139.752274	38.260289	140.882235	皇居～仙台駅
35.685187	139.752274	36.701526	137.213316	皇居～富山駅
35.685187	139.752274	36.642994	138.188653	皇居～長野駅
35.685187	139.752274	36.178553	133.324242	皇居～隠岐空港
35.685187	139.752274	36.082115	140.082335	皇居～研究学園駅
35.685187	139.752274	35.990160	139.083030	皇居～西武秩父駅
35.685187	139.752274	35.784434	139.900782	皇居～松戸駅
35.685187	139.752274	35.493836	134.226236	皇居～鳥取駅
35.685187	139.752274	35.464026	133.064003	皇居～松江駅
35.685187	139.752274	35.170581	136.882010	皇居～名古屋駅
35.685187	139.752274	34.985548	135.758851	皇居～京都駅
35.685187	139.752274	34.971500	138.389196	皇居～静岡駅
35.685187	139.752274	34.393702	131.401591	皇居～萩駅
35.685187	139.752274	34.350416	134.045520	皇居～高松駅
35.685187	139.752274	34.202712	129.287500	皇居～対馬市役所
35.685187	139.752274	33.948006	133.294802	皇居～新居浜駅
35.685187	139.752274	33.232621	131.606233	皇居～大分駅
35.685187	139.752274	31.915742	131.431997	皇居～宮崎駅
35.685187	139.752274	31.583617	130.541825	皇居～鹿児島駅
35.685187	139.752274	27.095627	142.191018	皇居～小笠原支庁
35.685187	139.752274	26.216843	127.718403	皇居～首里城跡
35.685187	139.752274	25.846517	131.263576	皇居～南大東空港
35.685187	139.752274	24.449582	122.934340	皇居～日本最西端之地
35.685187	139.752274	24.340547	124.155636	皇居～竹富町役場
35.685187	139.752274	24.192485	123.556720	皇居～中御神島
35.685187	139.752274	24.059749	123.805554	皇居～波照間空港
0	0	0	0		Debug
0	0	0.5	179.5		Debug
0	0	0.5	179.7		Debug
//	35.685187	139.752274	20.423690	136.075829	皇居～沖ノ鳥島
`;
//--------------------------------------------------------------------
// 度分秒 dddmmss.s...
//--------------------------------------------------------------------
const Data2 = `
354106.6732	1394508.1864	240335.0964	1234819.9944	皇居～波照間空港
//	354106.6732	1394508.1864	202525.284	1360432.9844	皇居～沖ノ鳥島
`;
//--------------------------------------------------------------------

//-------------------
// 度分秒 => 十進法
//-------------------
function rtnGeoIBLto10A(
	$deg, // 度
	$min, // 分
	$sec // 秒
) {
	$deg = parseInt($deg, 10);
	$min = parseInt($min, 10);
	$sec = parseFloat($sec);
	return parseFloat($deg + ($min / 60.0) + ($sec / 3600.0));
}

function rtnGeoIBLto10B(
	$ddmmss // ddmmss.s...
) {
	$ddmmss = parseFloat($ddmmss);

	let sign = 1;

	if ($ddmmss < 0) {
		sign = -1;
		$ddmmss = -$ddmmss;
	}
	const sec = parseFloat($ddmmss % 100);
	const min = parseInt(parseFloat($ddmmss / 100) % 100, 10);
	const deg = parseInt(parseFloat($ddmmss / 10000), 10);

	return sign * parseFloat(deg + (min / 60.0) + (sec / 3600.0));
}

//-------------------
// 十進法 => 度分秒
//-------------------
function rtnGeo10toIBL(
	$angle // 十進法
) {
	$angle = parseFloat($angle);

	let sign = 1;

	if ($angle < 0) {
		sign = -1;
		$angle = -$angle;
	}

	const deg = parseInt($angle, 10);
	$angle = ($angle - deg) * 60.0;
	let min = parseInt($angle, 10);
	$angle -= min;
	let sec = parseFloat($angle) * 60.0;

	// 0.999... * 60 => 60.0 対策
	if (sec == 60.0) {
		min += 1;
		sec = 0;
	}

	return [(sign * parseInt(deg, 10)), parseInt(min, 10), parseFloat(sec)];
}

//-------------------------------
// Vincenty法による２点間の距離
//-------------------------------
function rtnGeoVincentry(
	$lat1,
	$lng1,
	$lat2,
	$lng2
) {
	if ($lat1 == $lat2 && $lng1 == $lng2) {
		return [0.0, 0.0];
	}

	/// const A = 6378137.0;
	const _B = 6356752.314140356; // GRS80
	const _F = 0.003352810681182319; // 1 / 298.257222101
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

	let iLoop = 0;

	while (true) {
		sinLamda = Math.sin(lamda);
		cosLamda = Math.cos(lamda);
		sin2Sigma = (cosU2 * sinLamda) * (cosU2 * sinLamda) + (cosU1 * sinU2 - sinU1 * cosU2 * cosLamda) * (cosU1 * sinU2 - sinU1 * cosU2 * cosLamda);
		if (sin2Sigma < 0) {
			return [0.0, 0.0];
		}
		sinSigma = Math.sqrt(sin2Sigma);
		cosSigma = sinU1 * sinU2 + cosU1 * cosU2 * cosLamda;
		sigma = Math.atan2(sinSigma, cosSigma);
		sinAlpha = cosU1 * cosU2 * sinLamda / sinSigma;
		cos2Alpha = 1 - sinAlpha * sinAlpha;
		cos2sm = cosSigma - 2 * sinU1 * sinU2 / cos2Alpha;
		c = _F / 16 * cos2Alpha * (4 + _F * (4 - 3 * cos2Alpha));
		dLamda = lamda;
		lamda = omega + (1 - c) * _F * sinAlpha * (sigma + c * sinSigma * (cos2sm + c * cosSigma * (-1 + 2 * cos2sm * cos2sm)));
		if (Math.abs(lamda - dLamda) <= 1e-12) {
			break;
		}
		++iLoop;
		// 日本国内であれば５回程度で収束
		if (iLoop > 10) {
			return [-1, -1]; // Err
		}
	}

	let d2 = cos2Alpha * (1 - f1 * f1) / (f1 * f1);
	let a = 1 + d2 / 16384 * (4096 + d2 * (-768 + d2 * (320 - 175 * d2)));
	let b = d2 / 1024 * (256 + d2 * (-128 + d2 * (74 - 47 * d2)));
	let dSigma = b * sinSigma * (cos2sm + b / 4 * (cosSigma * (-1 + 2 * cos2sm * cos2sm) - b / 6 * cos2sm * (-3 + 4 * sinSigma * sinSigma) * (-3 + 4 * cos2sm * cos2sm)));
	let km = (_B * a * (sigma - dSigma)) / 1000; // m => km
	let bearing = Math.atan2(cosU2 * sinLamda, cosU1 * sinU2 - sinU1 * cosU2 * cosLamda) * 57.29577951308232;

	// 変換
	if (bearing < 0) {
		bearing += 360.0; // 度
	}

	return [parseFloat(km), parseFloat(bearing)];
}

//-------
// Main
//-------
const Separater = "\t";

//---------------
// 計算／十進法
//---------------
function main_Data1() {
	for (let _s1 of Data1.split("\n")) {
		_s1 = _s1.trim();

		if (_s1.length > 0 && _s1.substr(0, 2) != "//") {
			console.log(_s1);

			let as1 = [];

			let ad1 = _s1.split(Separater).slice(0, 4);
			for (let _d1 of ad1) {
				const [deg, min, sec] = rtnGeo10toIBL(_d1);
				as1.push(`${deg}度${min}分${sec.toFixed(6)}秒`);
			}
			console.log(as1.join(Separater));

			const [dist, angle] = rtnGeoVincentry(ad1[0], ad1[1], ad1[2], ad1[3]);
			if (dist < 0) {
				console.log("計測不能\n");
			} else {
				console.log("%skm%s%s度\n", dist.toFixed(6), Separater, angle.toFixed(6));
			}
		}
	}
}

//---------------
// 計算／度分秒
//---------------
function main_Data2() {
	for (let _s1 of Data2.split("\n")) {
		_s1 = _s1.trim();

		if (_s1.length > 0 && _s1.substr(0, 2) != "//") {
			console.log(_s1);

			let aLatLng = [];
			let as1 = [];

			for (let _d1 of _s1.split(Separater).slice(0, 4)) {
				const angle = rtnGeoIBLto10B(_d1);
				aLatLng.push(angle);
				as1.push(angle.toFixed(6) + "度");
			}
			console.log(as1.join(Separater));

			const [dist, angle] = rtnGeoVincentry(aLatLng[0], aLatLng[1], aLatLng[2], aLatLng[3]);
			if (dist < 0) {
				console.log("計測不能\n");
			} else {
				console.log("%skm%s%s度\n", dist.toFixed(6), Separater, angle.toFixed(6));
			}
		}
	}
}

//-------
// Exec
//-------
main_Data1();
main_Data2();
