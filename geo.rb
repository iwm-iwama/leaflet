#coding:utf-8

#---------------------------------------------------------------------
# [北緯1]	[東経1]	[北緯2]	[東経2]	[その他]
#---------------------------------------------------------------------
# 十進法 ddd.d...
#---------------------------------------------------------------------
$data1 = <<'EOD' # 非展開
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
35.685187	139.752274	20.423690	136.075829	皇居～沖ノ鳥島
EOD
#---------------------------------------------------------------------
# 度分秒 dddmmss.s...
#---------------------------------------------------------------------
$data2 = <<'EOD' # 非展開
360613.5892	1400516.2781	353918.1025	1394441.1016	国土地理院～赤羽橋駅付近
EOD
#---------------------------------------------------------------------

Signal.trap(:INT) do
	exit
end

#-------------------
# 度分秒 => 十進法
#-------------------
#【使用例】
#	printf("%f度\n", rtnGeoIBLto10(24, 26, 58.495200))
#
def rtnGeoIBLto10(
	d1, # 度
	d2, # 分
	d3  # 秒
)
	d1, d2, d3 = d1.to_f, d2.to_f, d3.to_f
	return (d1 + (d2 * 60.0 + d3) / 3600.0)
end

#-------------------
# 十進法 => 度分秒
#-------------------
#【使用例】
#	degree, min, sec = rtnGeo10toIBL(24.449582)
#	printf("%d度%d分%f秒\n", degree, min, sec)
#
def rtnGeo10toIBL(
	d1 # 十進法
)
	d1 = d1.to_f

	deg = d1.to_i
		d1 = (d1 - deg) * 60.0
	min = d1.to_i
		d1 -= min
	sec = d1.to_f * 60.0

	# 0.999... * 60 => 60.0 対策
	if sec == 60.0
		min += 1
		sec = 0
	end

	return [deg.to_i, min.to_i, sec.to_f]
end

#-------------------------------
# Vincenty法による２点間の距離
#-------------------------------
#【参考】
#	http:#tancro.e-central.tv/grandmaster/script/vincentyJS.html
#
#【使用例】
#	dist, angle = rtnGeoVincentry(35.685187, 139.752274, 24.449582, 122.93434)
#	printf("%fkm %f度\n", dist, angle)
#
$A   = 6378137.0
$B   = 6356752.314
$F   = (1 / 298.257222101)
$RAD = Math::PI / 180.0

def rtnGeoVincentry(
	lat1, # 開始～緯度
	lng1, # 開始～経度
	lat2, # 終了～緯度
	lng2  # 終了～経度
)
	lat1 = lat1.to_f
	lng1 = lng1.to_f
	lat2 = lat2.to_f
	lng2 = lng2.to_f

	if lat1 == lat2 && lng1 == lng2
		return [0, 0]
	end

	latR1 = lat1 * $RAD
	lngR1 = lng1 * $RAD
	latR2 = lat2 * $RAD
	lngR2 = lng2 * $RAD

	f1 = 1 - $F

	omega  = lngR2 - lngR1
	tanU1  = f1 * Math.tan(latR1)
	cosU1  = 1 / Math.sqrt(1 + (tanU1 * tanU1))
	sinU1  = tanU1 * cosU1
	tanU2  = f1 * Math.tan(latR2)
	cosU2  = 1 / Math.sqrt(1 + (tanU2 * tanU2))
	sinU2  = tanU2 * cosU2
	lamda  = omega
	dLamda = 0.0

	sinLamda  = 0.0
	cosLamda  = 0.0
	sin2sigma = 0.0
	sinSigma  = 0.0
	cosSigma  = 0.0
	sigma     = 0.0
	sinAlpha  = 0.0
	cos2alpha = 0.0
	cos2sm    = 0.0
	c = 0.0

	count = 0

	loop do
		sinLamda = Math.sin(lamda)
		cosLamda = Math.cos(lamda)
		sin2sigma = (cosU2 * sinLamda) * (cosU2 * sinLamda) + (cosU1 * sinU2 - sinU1 * cosU2 * cosLamda) * (cosU1 * sinU2 - sinU1 * cosU2 * cosLamda)
		if sin2sigma < 0.0
			return [0, 0]
		end
		sinSigma = Math.sqrt(sin2sigma)
		cosSigma = sinU1 * sinU2 + cosU1 * cosU2 * cosLamda
		sigma = Math.atan2(sinSigma, cosSigma)
		sinAlpha = cosU1 * cosU2 * sinLamda / sinSigma
		cos2alpha = 1 - sinAlpha * sinAlpha
		cos2sm = cosSigma - 2 * sinU1 * sinU2 / cos2alpha
		if !cos2sm
			cos2sm = 0
		end
		c = $F / 16 * cos2alpha * (4 + $F * (4 - 3 * cos2alpha))
		dLamda = lamda
		lamda = omega + (1 - c) * $F * sinAlpha * (sigma + c * sinSigma * (cos2sm + c * cosSigma * (-1 + 2 * cos2sm * cos2sm)))

		break if (count += 1) > 10 || (lamda - dLamda).abs <= 1e-12
	end

	u2 = cos2alpha * (1 - f1 * f1) / (f1 * f1)
	a = 1 + u2 / 16384 * (4096 + u2 * (-768 + u2 * (320 - 175 * u2)))
	b = u2 / 1024 * (256 + u2 * (-128 + u2 * (74 - 47 * u2)))
	dSigma = b * sinSigma * (cos2sm + b / 4 * (cosSigma * (-1 + 2 * cos2sm * cos2sm) - b / 6 * cos2sm * (-3 + 4 * sinSigma * sinSigma) * (-3 + 4 * cos2sm * cos2sm)))
	alpha12 = Math.atan2(cosU2 * sinLamda, cosU1 * sinU2 - sinU1 * cosU2 * cosLamda) * 180 / Math::PI
	dist = $B * a * (sigma - dSigma)

	# 変換
	alpha12 += 360.0 if alpha12 < 0 # 360度表記
	dist /= 1000.0 # m => km

	return [dist.to_f, alpha12.to_f]
end

#---------
# 十進法
#---------
$data1.split("\n").each do
	|s|
	s.strip!
	if s.size > 0
		s.gsub!(/[\t\s,]+/, " ")

		puts s

		lat1, lng1, lat2, lng2 = s.split(" ")
		[lat1, lng1, lat2, lng2].each do
			|s|
			deg, min, sec = rtnGeo10toIBL(s)
			printf("%d度%d分%f秒 ", deg, min, sec)
		end

		puts

		dist, angle = rtnGeoVincentry(lat1, lng1, lat2, lng2)
		printf("%fkm %f度\n\n", dist, angle)
	end
end

#---------
# 度分秒
#---------
$data2.split("\n").each do
	|s|
	s.strip!
	if s.size > 0
		s.gsub!(/[\t\s,]+/, " ")

		puts s

		aLatLng = []

		lat1, lng1, lat2, lng2 = s.split(" ")
		[lat1, lng1, lat2, lng2].each do
			|s|
			as1 = s.split(/(\d{1,3})(\d{2})(\d{2}\.*\d*)/)
			degree = rtnGeoIBLto10((as1[0] + as1[1]).to_i, as1[2].to_i, as1[3].to_f)
			printf("%f度 ", degree)
			aLatLng << degree
		end

		puts

		dist, angle = rtnGeoVincentry(aLatLng[0], aLatLng[1], aLatLng[2], aLatLng[3])
		printf("%fkm %f度\n\n", dist, angle)
	end
end

exit
