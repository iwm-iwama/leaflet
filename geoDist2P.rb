#!/usr/bin/env ruby
#coding:utf-8
# > ruby geoDist2P.rb

Signal.trap(:INT) do
	exit
end

#---------------------------------------------------------------------
# [北緯1]	[東経1]	[北緯2]	[東経2]	[その他]
#---------------------------------------------------------------------
# 十進法 ddd.d...
#---------------------------------------------------------------------
Data1 = <<EOD
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
0	0	0.5	179.5		Debug:19936.288579km?
//	35.685187	139.752274	20.423690	136.075829	皇居～沖ノ鳥島
EOD
#---------------------------------------------------------------------
# 度分秒 dddmmss.s...
#---------------------------------------------------------------------
Data2 = <<EOD
354106.6732	1394508.1864	240335.0964	1234819.9944	皇居～波照間空港
//	354106.6732	1394508.1864	202525.284	1360432.9844	皇居～沖ノ鳥島
EOD
#---------------------------------------------------------------------

#-------------------
# 度分秒 => 十進法
#-------------------
def
rtnGeoIBLto10A(
	deg, # 度
	min, # 分
	sec  # 秒
)
	deg, min, sec = deg.to_i, min.to_i, sec.to_f
	return (deg + (min / 60.0) + (sec / 3600.0)).to_f
end

def
rtnGeoIBLto10B(
	ddmmss # ddmmss.s...
)
	ddmmss = ddmmss.to_f

	sign = 1

	if ddmmss < 0
		sign = -1
		ddmmss = -ddmmss
	end

	sec = ddmmss % 100
	min = ((ddmmss / 100).to_i) % 100
	deg = (ddmmss / 10000).to_i

	return sign * (deg + (min / 60.0) + (sec / 3600.0)).to_f
end

#-------------------
# 十進法 => 度分秒
#-------------------
def
rtnGeo10toIBL(
	angle # 十進法
)
	angle = angle.to_f

	sign = 1

	if angle < 0
		sign = -1
		angle = -angle
	end

	deg = angle.to_i
		angle = (angle - deg) * 60.0
	min = angle.to_i
		angle -= min
	sec = angle.to_f * 60.0

	# 0.999... * 60 => 60.0 対策
	if sec == 60.0
		min += 1
		sec = 0
	end

	return [(sign * deg).to_i, min.to_i, sec.to_f]
end

#-------------------------------
# Vincenty法による２点間の距離
#-------------------------------
def
rtnGeoVincentry(
	lat1, # 開始～緯度
	lng1, # 開始～経度
	lat2, # 終了～緯度
	lng2  # 終了～経度
)
	lat1, lng1, lat2, lng2 = lat1.to_f, lng1.to_f, lat2.to_f, lng2.to_f

	if lat1 == lat2 && lng1 == lng2
		return [0.0, 0.0]
	end

	## _A = 6378137.0
	_B   = 6356752.314140356    # GRS80
	_F   = 0.003352810681182319 # 1 / 298.257222101
	_RAD = 0.017453292519943295 # π / 180

	latR1 = lat1 * _RAD
	lngR1 = lng1 * _RAD
	latR2 = lat2 * _RAD
	lngR2 = lng2 * _RAD

	f1 = 1 - _F

	omega  = lngR2 - lngR1
	tanU1  = f1 * Math.tan(latR1)
	cosU1  = 1 / Math.sqrt(1 + tanU1 * tanU1)
	sinU1  = tanU1 * cosU1
	tanU2  = f1 * Math.tan(latR2)
	cosU2  = 1 / Math.sqrt(1 + tanU2 * tanU2)
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

	while true
		sinLamda = Math.sin(lamda)
		cosLamda = Math.cos(lamda)
		sin2sigma = (cosU2 * sinLamda) * (cosU2 * sinLamda) + (cosU1 * sinU2 - sinU1 * cosU2 * cosLamda) * (cosU1 * sinU2 - sinU1 * cosU2 * cosLamda)
		if sin2sigma < 0.0
			return [0.0, 0.0]
		end
		sinSigma = Math.sqrt(sin2sigma)
		cosSigma = sinU1 * sinU2 + cosU1 * cosU2 * cosLamda
		sigma = Math.atan2(sinSigma, cosSigma)
		sinAlpha = cosU1 * cosU2 * sinLamda / sinSigma
		cos2alpha = 1 - sinAlpha * sinAlpha
		cos2sm = cosSigma - 2 * sinU1 * sinU2 / cos2alpha
		c = _F / 16 * cos2alpha * (4 + _F * (4 - 3 * cos2alpha))
		dLamda = lamda
		lamda = omega + (1 - c) * _F * sinAlpha * (sigma + c * sinSigma * (cos2sm + c * cosSigma * (-1 + 2 * cos2sm * cos2sm)))

		if (lamda - dLamda).abs <= 1e-12
			break
		end
	end

	u2 = cos2alpha * (1 - f1 * f1) / (f1 * f1)
	a = 1 + u2 / 16384 * (4096 + u2 * (-768 + u2 * (320 - 175 * u2)))
	b = u2 / 1024 * (256 + u2 * (-128 + u2 * (74 - 47 * u2)))
	dSigma = b * sinSigma * (cos2sm + b / 4 * (cosSigma * (-1 + 2 * cos2sm * cos2sm) - b / 6 * cos2sm * (-3 + 4 * sinSigma * sinSigma) * (-3 + 4 * cos2sm * cos2sm)))
	angle = Math.atan2(cosU2 * sinLamda, cosU1 * sinU2 - sinU1 * cosU2 * cosLamda) * 57.29577951308232
	dist = _B * a * (sigma - dSigma)

	# 変換
	if angle < 0
		angle += 360.0 # 360度表記
	end
	dist /= 1000.0 # m => km

	return [dist.to_f, angle.to_f]
end

#-------
# Main
#-------
Separater = "\t"

#---------------
# 計算／十進法
#---------------
def
main_Data1()
	Data1.each_line do
		|ln|
		ln = ln.strip

		if ln.size > 0 && ln[0, 2] != "//"
			puts ln

			as1 = []

			ad1 = ln.split(Separater).slice(0, 4)
			ad1.each do
				|ln|
				deg, min, sec = rtnGeo10toIBL(ln)
				as1 << sprintf("%d度%d分%.6f秒", deg, min, sec)
			end
			puts as1.join(Separater)

			dist, angle = rtnGeoVincentry(ad1[0], ad1[1], ad1[2], ad1[3])
			printf("%.6fkm%s%.6f度\n\n", dist, Separater, angle)
		end
	end
end

#---------------
# 計算／度分秒
#---------------
def
main_Data2()
	Data2.each_line do
		|ln|
		ln = ln.strip

		if ln.size > 0 && ln[0, 2] != "//"
			puts ln

			aLatLng = []
			as1 = []

			ln.split(Separater).slice(0, 4).each do
				|ln|
				angle = rtnGeoIBLto10B(ln)
				aLatLng << angle
				as1 << sprintf("%.6f度", angle)
			end
			puts as1.join(Separater)

			dist, angle = rtnGeoVincentry(aLatLng[0], aLatLng[1], aLatLng[2], aLatLng[3])
			printf("%.6fkm%s%.6f度\n\n", dist, Separater, angle)
		end
	end
end

#-------
# Exec
#-------
main_Data1()
main_Data2()
