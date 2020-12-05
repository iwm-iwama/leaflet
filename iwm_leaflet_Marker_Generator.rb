#!ruby
#coding:utf-8
# > ruby iwm_leaflet_Marker_Generator.rb [入力ファイル]

Signal.trap(:INT) do
	exit
end

require "nkf"

$iFn = ARGV[0]

if $iFn == nil || ! File.exist?($iFn)
	puts
	puts "\e[1;35m先頭行がラベル（北緯,東経,...）のCSV／TSVファイルから\niwm_leaflet.html のマーカーを生成"
	puts
	puts "\e[1;37;41m > ruby #{File.basename($0)} [入力ファイル] \e[0;39m"
	puts
	puts "\e[1;35m (例)\e[1;37m ruby #{File.basename($0)} ./基本基準点.csv"
	puts
	puts "\e[1;36m ※十進法 ddd.d..."
	puts "\e[1;33m (入力)\e[1;37m"
	puts "   北緯,東経,場所"
	puts "   35.685187,139.752274,皇居"
	puts "\e[1;33m (出力)\e[1;37m"
	puts "   35.685187	139.752274	<font color=\"#ff0000\">皇居</font>	<font color=\"#0000ff\">北緯</font> 35.685187	<font color=\"#0000ff\">東経</font> 139.752274"
	puts "\e[0;39m"
	exit
end

# 読込データをUTF-8に統一
Data1 = NKF.nkf("-w", File.open($iFn, "rt").read())

#-------
# Main
#-------
Splitter = "[,\t]"
Separater = "\t"

def main_Data1()
	aTag = []
	iLine = 0

	Data1.each_line do
		|_s1|
		_s1 = _s1.strip

		str = ""

		if _s1.size > 0 && _s1[0, 2] != "//"
			# 入力フォーマット CSV, TSV に対応
			_a1 = _s1.split(/#{Splitter}/)

			# １行目はラベル
			if iLine == 0
				aTag = _a1
			# ２行目以降はデータ
			else
				# [0]北緯, [1]東経 を付与
				str << _a1[0] + Separater + _a1[1]

				# [2] のタグを生成
				if _a1[2]
					str << "#{Separater}<font color=\"#ff5858\">#{_a1[2]}</font>"
				end

				# [2] 以外のタグを生成
				_i1 = 0
				_a1.each do
					|_s2|
					if _i1 != 2
						str << Separater
						if aTag[_i1]
							str << "<font color=\"#3d7cce\">#{aTag[_i1]}</font>"
						end
						str << _s2
					end
					_i1 += 1
				end

				puts str
			end

			iLine += 1
		end
	end
end

#-------
# Exec
#-------
main_Data1()
