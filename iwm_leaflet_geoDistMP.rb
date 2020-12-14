#!ruby
#coding:utf-8
# > ruby iwm_leaflet_geoDistMP.rb [入力ファイル]

Signal.trap(:INT) do
	exit
end

$iFn = ARGV[0]

if $iFn == nil || ! File.exist?($iFn)
	puts
	puts "\e[1;35miwm_leaflet.html が出力したTSVファイルから総延長／区間距離を計算"
	puts
	puts "\e[1;37;41m > ruby #{File.basename($0)} [入力ファイル] \e[0;39m"
	puts
	puts "\e[1;35m (例)\e[1;37m ruby #{File.basename($0)} ./マーカー変換.tsv"
	puts
	puts "\e[1;36m ※十進法 ddd.d..."
	puts "\e[1;33m (入力)\e[1;37m"
	puts "   // 北緯	東経	場所"
	puts "   35.685187	139.752274	皇居"
	puts "   24.449582	122.934340	日本最西端之地"
	puts "\e[0;39m"
	exit
end

#-------------------------------
# Vincenty法による２点間の距離
#-------------------------------
# (参考)
#	http://tancro.e-central.tv/grandmaster/script/vincentyJS.html
#
# (例)
#	dist, angle = rtnGeoVincentry(35.685187, 139.752274, 24.449582, 122.93434)
#	printf("%fkm %f度\n", dist, angle)
#
def rtnGeoVincentry(
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

	count = 0

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

		if (count += 1) > 10 || (lamda - dLamda).abs <= 1e-12
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
require "nkf"

Splitter = "[,\t]"
Separater = "\t"

#---------------
# 計算／十進法
#---------------
def main_Data1()
	iTotalDist = 0.0
	aOld = []

	# 読込データをUTF-8に統一
	NKF.nkf("-w", File.open($iFn, "rt").read()).each_line do
		|_s1|
		_a1 = _s1.strip.split(/#{Splitter}/)

		# 厳密チェック
		if rtnIsDecimal(_a1[0], _a1[1])
			dist, angle = aOld[0] ?
				rtnGeoVincentry(aOld[0], aOld[1], _a1[0], _a1[1]) :
				[0.0, 0.0]

			str = sprintf("%fkm%s%f度", dist, Separater, angle)
			_a1.each do
				|_s2|
				str << Separater + _s2
			end
			puts str

			iTotalDist += dist
			aOld = _a1
		end
	end

	printf("%fkm\n\n", iTotalDist)
end

#---------------------
# 緯度・経度チェック
#---------------------
def rtnIsDecimal(*aStr)
	aStr.each() do
		|_s1|
		if ! (_s1 =~ /^[\+\-]{0,1}[0-9]+\.{0,1}[0-9]*$/)
			return false
		end
	end
	return true
end

def subDataChecker(data)
	iLine = 0
	sErr = ""

	data.each_line do
		|_s1|
		_s1 = _s1.strip

		iLine += 1

		if _s1.size > 0 && _s1[0, 2] != "//"
			_a1 = _s1.split(/#{Splitter}/)

			if ! rtnIsDecimal(_a1[0], _a1[1])
				sErr << sprintf("L%d\t%s\t%s\n", iLine, _a1[0], _a1[1])
			end
		end
	end

	if sErr.size > 0
		puts ">> Error data?"
		puts sErr
		puts
	end
end

#-------
# Exec
#-------
main_Data1()
subDataChecker(Data1)
