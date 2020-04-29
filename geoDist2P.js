#!node
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

/*-------------------
// 度分秒 => 十進法
-------------------*/
/* (例)
	console.log(rtnGeoIBLto10A(24, 26, 58.495200).toFixed(6) + "度");
*/
function rtnGeoIBLto10A(
	$deg, // 度
	$min, // 分
	$sec  // 秒
)
{
	$deg = parseInt($deg, 10);
	$min = parseInt($min, 10);
	$sec = parseFloat($sec);
	return parseFloat($deg + ($min / 60.0) + ($sec / 3600.0));
}
/* (例)
	console.log(rtnGeoIBLto10B(242658.495200).toFixed(6) + "度");
*/
function rtnGeoIBLto10B(
	$ddmmss // ddmmss.s...
)
{
	$ddmmss = parseFloat($ddmmss);

	var sign = 1;

	if($ddmmss < 0){
		sign = -1;
		$ddmmss = -$ddmmss;
	}
	var sec = parseFloat($ddmmss % 100);
	var min = parseInt(parseFloat($ddmmss / 100) % 100, 10);
	var deg = parseInt(parseFloat($ddmmss / 10000), 10);

	return parseFloat(deg + (min / 60.0) + (sec / 3600.0)) * sign;
}

/*-------------------
// 十進法 => 度分秒
-------------------*/
/* (例)
	var [deg, min, sec] = rtnGeo10toIBL(24.449582);
	console.log(deg + "度" + min + "分" + sec.toFixed(6) + "秒");
*/
function rtnGeo10toIBL(
	$angle // 十進法
)
{
	$angle = parseFloat($angle);

	var sign = 1;

	if($angle < 0){
		sign = -1;
		$angle = -$angle;
	}
	var deg = parseInt($angle, 10);
		$angle = ($angle - deg) * 60.0;
	var min = parseInt($angle, 10);
		$angle -= min;
	var sec = parseFloat($angle) * 60.0;

	// 0.999... * 60 => 60.0 対策
	if(sec == 60.0)
	{
		min += 1;
		sec = 0;
	}

	return [parseInt(deg, 10) * sign, parseInt(min, 10), parseFloat(sec)];
}

/*-------------------------------
// Vincenty法による２点間の距離
-------------------------------*/
/*【参考】
	http://tancro.e-central.tv/grandmaster/script/vincentyJS.html
*/
/* (例)
	var [dist, angle] = rtnGeoVincentry(35.685187, 139.752274, 24.449582, 122.934340);
	console.log("%skm %s度", dist.toFixed(6), angle.toFixed(6));
*/
function rtnGeoVincentry(
	$lat1,
	$lng1,
	$lat2,
	$lng2
)
{
	$lat1 = parseFloat($lat1);
	$lng1 = parseFloat($lng1);
	$lat2 = parseFloat($lat2);
	$lng2 = parseFloat($lng2);

	if ($lat1 == $lat2 && $lng1 == $lng2)
	{
		return [0.0, 0.0];
	}

	/// const _A = 6378137.0;
	const _B   = 6356752.314;
	const _F   = 1 / 298.257222101;
	const _RAD = Math.PI / 180.0

	const latR1 = $lat1 * _RAD;
	const lngR1 = $lng1 * _RAD;
	const latR2 = $lat2 * _RAD;
	const lngR2 = $lng2 * _RAD;

	const f1 = 1 - _F;

	const omega = lngR2 - lngR1;
	const tanU1 = f1 * Math.tan(latR1);
	const cosU1 = 1 / Math.sqrt(1 + tanU1 * tanU1);
	const sinU1 = tanU1 * cosU1;
	const tanU2 = f1 * Math.tan(latR2);
	const cosU2 = 1 / Math.sqrt(1 + tanU2 * tanU2);
	const sinU2 = tanU2 * cosU2;

	var lamda = omega;
	var dLamda = 0;

	var sinLamda  = 0.0;
	var cosLamda  = 0.0;
	var sin2sigma = 0.0;
	var sinSigma  = 0.0;
	var cosSigma  = 0.0;
	var sigma     = 0.0;
	var sinAlpha  = 0.0;
	var cos2alpha = 0.0;
	var cos2sm    = 0.0;
	var c = 0.0;

	var count = 0;

	do
	{
		sinLamda = Math.sin(lamda);
		cosLamda = Math.cos(lamda);
		sin2sigma = (cosU2 * sinLamda) * (cosU2 * sinLamda) + (cosU1 * sinU2 - sinU1 * cosU2 * cosLamda) * (cosU1 * sinU2 - sinU1 * cosU2 * cosLamda);
		if(sin2sigma < 0)
		{
			return [0.0, 0.0];
		}
		sinSigma = Math.sqrt(sin2sigma);
		cosSigma = sinU1 * sinU2 + cosU1 * cosU2 * cosLamda;
		sigma = Math.atan2(sinSigma, cosSigma);
		sinAlpha = cosU1 * cosU2 * sinLamda / sinSigma;
		cos2alpha = 1 - sinAlpha * sinAlpha;
		cos2sm = cosSigma - 2 * sinU1 * sinU2 / cos2alpha;
		if(isNaN(cos2sm))
		{
			cos2sm = 0;
		}
		c = _F / 16 * cos2alpha * (4 + _F * (4 - 3 * cos2alpha));
		dLamda = lamda;
		lamda = omega + (1 - c) * _F * sinAlpha * (sigma + c * sinSigma * (cos2sm + c * cosSigma * (-1 + 2 * cos2sm * cos2sm)));
		if(count++ > 10)
		{
			break;
		}
	}
	while(Math.abs(lamda - dLamda) > 1e-12);

	var u2 = cos2alpha * (1 - f1 * f1) / (f1 * f1);
	var a = 1 + u2 / 16384 * (4096 + u2 * (-768 + u2 * (320 - 175 * u2)));
	var b = u2 / 1024 * (256 + u2 * (-128 + u2 * (74 - 47 * u2)));
	var dSigma = b * sinSigma * (cos2sm + b / 4 * (cosSigma * (-1 + 2 * cos2sm * cos2sm) - b / 6 * cos2sm * (-3 + 4 * sinSigma * sinSigma) * (-3 + 4 * cos2sm * cos2sm)));
	var angle = Math.atan2(cosU2 * sinLamda, cosU1 * sinU2 - sinU1 * cosU2 * cosLamda) * 180 / Math.PI;
	var dist = _B * a * (sigma - dSigma);

	// 変換
	if(angle < 0)
	{
		angle += 360.0; // "度"
	}
	dist /= 1000.0; // "m" => "km"

	return [parseFloat(dist), parseFloat(angle)];
}

//---------
// main()
//---------
const Separater = " "

//---------------
// 計算／十進法
//---------------
function main_Data1()
{
	for(var _s1 of Data1.split("\n"))
	{
		_s1 = _s1.trim();

		if(_s1.length > 0 && _s1.substr(0, 2) != "//")
		{
			_s1 = _s1.replace(/[\t\s,]+/g, Separater);
			console.log(_s1);

			var as1 = [];

			var ad1 = _s1.split(Separater).slice(0, 4);
			for(var _d1 of ad1)
			{
				var [deg, min, sec] = rtnGeo10toIBL(_d1);
				as1.push(deg + "度" + min + "分" + sec.toFixed(6) + "秒");
			}
			console.log(as1.join(Separater));

			var [dist, angle] = rtnGeoVincentry(ad1[0], ad1[1], ad1[2], ad1[3]);
			console.log("%skm %s度", dist.toFixed(6), angle.toFixed(6));

			console.log();
		}
	}
}

//---------------
// 計算／度分秒
//---------------
function main_Data2()
{
	for(var _s1 of Data2.split("\n"))
	{
		_s1 = _s1.trim();

		if(_s1.length > 0 && _s1.substr(0, 2) != "//")
		{
			_s1 = _s1.replace(/[\t\s,]+/g, Separater);
			console.log(_s1);

			var aLatLng = [];
			var as1 = [];

			var ad1 = _s1.split(Separater).slice(0, 4);
			for(var _d1 of ad1)
			{
				var angle = rtnGeoIBLto10B(_d1);
				aLatLng.push(angle);
				as1.push(angle.toFixed(6) + "度");
			}
			console.log(as1.join(Separater));

			var [dist, angle] = rtnGeoVincentry(aLatLng[0], aLatLng[1], aLatLng[2], aLatLng[3]);
			console.log("%skm %s度", dist.toFixed(6), angle.toFixed(6));

			console.log();
		}
	}
}

main_Data1();
main_Data2();
