#!ruby
#coding:utf-8
# > ruby iwm_leaflet_Marker_Generator.rb [入力ファイル]

Signal.trap(:INT) do
	exit
end

Cmd = File.basename($0)
IFn = ARGV[0]

if ! IFn || ! File.exist?(IFn)
	puts
	puts "\e[0;97;104m 先頭行がラベル（北緯,東経,...）のCSV／TSVファイルから \e[0;99m"
	puts "\e[0;97;104m iwm_leaflet.html のマーカーを生成                     \e[0;99m"
	puts
	puts "\e[0;97;101m ruby #{Cmd} [File] \e[0;99m"
	puts
	puts "\e[0;95m(例)\e[0;97m ruby #{Cmd} ./基本基準点.csv"
	puts
	puts "\e[0;96m※十進法 ddd.d..."
	puts "\e[0;93m(入力)\e[0;97m"
	puts "  北緯,東経,場所"
	puts "  35.685187,139.752274,皇居"
	puts "\e[0;93m(出力)\e[0;97m"
	puts "  35.685187	139.752274	<font color=\"#ff5858\">皇居</font>	<font color=\"#3d7cce\">北緯</font>35度41分6.673200秒／35.685187度	<font color=\"#3d7cce\">東経</font>139度45分8.186400秒／139.752274度"
	puts "\e[0;99m"
	exit
end

#-------------------
# 十進法 => 度分秒
#-------------------
# (例)
#	deg, min, sec = rtnGeo10toIBL(24.449582)
#	printf("%d度%d分%f秒\n", deg, min, sec)
#
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

#-------
# Main
#-------
Splitter = /[,\t]/
Separater = "\t"

def
main()
	aTag = []
	iLine = 0
	sErr = ""

	File.open(IFn, "rt").read().split("\n").each do
		|_s1|
		_s1 = _s1.strip

		str = ""

		if _s1.size > 0 && _s1[0, 2] != "//"
			# 入力フォーマット CSV, TSV に対応
			_a1 = _s1.split(Splitter)

			iLine += 1

			# １行目はラベル
			if iLine == 1
				if _s1 =~ /^[+-]*\d/
					sErr << "\e[0;93mL#{iLine.to_s}\t\e[0;97m#{_s1}\n"
					sErr << "\e[0;95m\t>> ラベル名の先頭に数字は使えない ×'0ラベル名' ○'ラベル名0'\n"
				else
					aTag = _a1
				end
			# ２行目以降はデータ
			else
				# [0]北緯, [1]東経 を付与
				str << "#{_a1[0]}#{Separater}#{_a1[1]}"

				# [2] のタグを生成
				str << "#{Separater}<font color=\"#ff5858\">#{_a1[2]}</font>"

				# [2] 以外のタグを生成
				_idx = 0
				_a1.each do
					|_s2|

					if _idx != 2
						str << Separater

						if aTag[_idx]
							str << "<font color=\"#3d7cce\">#{aTag[_idx]}</font>"
						end

						if _idx < 2
							deg, min, sec = rtnGeo10toIBL(_a1[_idx])
							str << sprintf("%d度%d分%.6f秒／%.6f度", deg, min, sec, _a1[_idx])
						else
							str << _s2
						end
					end

					_idx += 1
				end

				puts str
			end
		end
	end

	if sErr.size > 0
		$stderr.printf("\n\e[0;91m>> Error data?\n%s\n\e[0;99m", sErr)
	end
end

#-------
# Exec
#-------
main()
