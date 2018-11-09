//调整兼容
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
audioContext = window.AudioContext || window.webkitAudioContext;

var SRecorder = function (stream) {
    var aContext = new audioContext();
    var audioInput = aContext.createMediaStreamSource(stream);
    var recorder = aContext.createScriptProcessor(1024, 1, 1); //录音缓冲区大小，输入通道数，输出通道数

    //实例化speex编码器
    var codec = new Speex({
        quality: 3
    });
    //重置采样率
    var resampler = new Resampler(aContext.sampleRate, 8000, 1, 2048);

    var audioData = {
        audioBuffer: [], //语音缓存
        audioOffset: 0, //偏移量
        useSaveBuffer: [], //用于保存的语音
        inputUseSaveBuffer: function (buffer) {
            for (let i = 0; i < buffer.length; i++) {
                this.useSaveBuffer.push(buffer[i]);
            }
        },
        inputSaveBuffer: function (id) {
            let map = {};
            map['msId'] = id;
            let data = this.encodeWav(this.useSaveBuffer);
            map['voice'] = data;
            saveBuff = map;
            //this.playWav(data);
            this.useSaveBuffer = [];
        },
        send: function () {
            var sendInterval;
            var sendLength = (16 * aContext.sampleRate / 8) / 50;

            sendInterval = setInterval(function () {
                if (!door && ((audioData.audioOffset + 1) * sendLength) > (audioData.audioBuffer.length)) {
                    window.clearInterval(sendInterval);
                    audioData.audioBuffer = [];
                    audioData.audioOffset = 0;
                    audioData.inputSaveBuffer(msId);
                    //发送挂断指令
                    var map = {};
                    map['cmd'] = 'HUP';
                    webSocket.send(JSON.stringify(map));
                    return;
                }

                //重置采样率
                var resSampleBuffer = resampler.resampler(audioData.audioBuffer.slice(audioData.audioOffset * sendLength, (audioData.audioOffset + 1) * sendLength));
                //console.log(resSampleBuffer);
                audioData.inputUseSaveBuffer(resSampleBuffer);

                //Float32Array转Int16Array
                var refillBuffer = new Int16Array(320);
                for (var i = 0; i < resSampleBuffer.length; ++i) {
                    refillBuffer[i] = Math.ceil(resSampleBuffer[i] * 32767);
                }
                //console.log(refillBuffer);

                //speex编码
                var encodeBuffer = codec.encode(refillBuffer);
                //console.log(encodeBuffer);

                //发送语音包
                var strData = encodeBuffer[0].join(",");
                var map = {};
                map['cmd'] = 'VOICEPAGE';
                map['data'] = strData;
                console.log(JSON.stringify(map))
                console.log(webSocket)
                webSocket.send(JSON.stringify(map));

                //偏移量递增
                audioData.audioOffset++;
            }, 40);
        },
        encodeWav: function (pcmBuffer) {
            var sampleRate = 8000; //输出采样率
            var sampleBits = 16; //输出采样位数
            var dataLength = pcmBuffer.length * (sampleBits / 8);
            var buffer = new ArrayBuffer(44 + dataLength);
            var data = new DataView(buffer);
            var channelCount = 1; //单声道
            var offset = 0;
            var writeString = function (str) {
                for (var i = 0; i < str.length; i++) {
                    data.setUint8(offset + i, str.charCodeAt(i));
                }
            };
            // 资源交换文件标识符
            writeString('RIFF');
            offset += 4;
            // 下个地址开始到文件尾总字节数,即文件大小-8
            data.setUint32(offset, 36 + dataLength, true);
            offset += 4;
            // WAV文件标志
            writeString('WAVE');
            offset += 4;
            // 波形格式标志
            writeString('fmt ');
            offset += 4;
            // 过滤字节,一般为 0x10 = 16
            data.setUint32(offset, 16, true);
            offset += 4;
            // 格式类别 (PCM形式采样数据)
            data.setUint16(offset, 1, true);
            offset += 2;
            // 通道数
            data.setUint16(offset, channelCount, true);
            offset += 2;
            // 采样率,每秒样本数,表示每个通道的播放速度
            data.setUint32(offset, sampleRate, true);
            offset += 4;
            // 波形数据传输率 (每秒平均字节数) 单声道×每秒数据位数×每样本数据位/8
            data.setUint32(offset, channelCount * sampleRate * (sampleBits / 8), true);
            offset += 4;
            // 快数据调整数 采样一次占用字节数 单声道×每样本的数据位数/8
            data.setUint16(offset, channelCount * (sampleBits / 8), true);
            offset += 2;
            // 每样本数据位数
            data.setUint16(offset, sampleBits, true);
            offset += 2;
            // 数据标识符
            writeString('data');
            offset += 4;
            // 采样数据总数,即数据总大小-44
            data.setUint32(offset, dataLength, true);
            offset += 4;
            // 写入采样数据
            if (sampleBits == 8) {
                for (var i = 0; i < pcmBuffer.length; i++, offset++) {
                    var s = Math.max(-1, Math.min(1, pcmBuffer[i]));
                    var val = s < 0 ? s * 0x8000 : s * 0x7FFF;
                    val = parseInt(255 / (65535 / (val + 32768)));
                    data.setInt8(offset, val, true);
                }
            } else {
                for (var i = 0; i < pcmBuffer.length; i++, offset += 2) {
                    var s = Math.max(-1, Math.min(1, pcmBuffer[i]));
                    data.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
                }
            }

            return data;
        },
        playWav: function (data) {
            //console.log(data);
            var reader = new FileReader();
            reader.readAsArrayBuffer(new Blob([data], {
                type: 'audio/wav'
            }));
            reader.onload = function (e) {
                aContext.decodeAudioData(reader.result, function (buffer) {
                    var audioBufferSouceNode = aContext.createBufferSource();
                    audioBufferSouceNode.buffer = buffer;
                    audioBufferSouceNode.connect(aContext.destination);
                    audioBufferSouceNode.start(0);
                }, function (e) {
                    console.log("Failed to decode the file");
                });
            }
        }
    };

    //音频采集
    recorder.onaudioprocess = function (e) {
        var tempBuff = e.inputBuffer.getChannelData(0);
        //console.log(tempBuff)
        for (let i = 0; i < tempBuff.length; i++) {
            audioData.audioBuffer.push(tempBuff[i]);
        }
        if (audioData.audioBuffer.length == 2048) {
            audioData.send();
        }
    }

    //开始录音
    this.start = function () {
        audioInput.connect(recorder);
        recorder.connect(aContext.destination);
    }

    //停止录音
    this.stop = function () {
        audioInput.disconnect();
        recorder.disconnect();
    }

    //播放
    this.play = function () {
        isPlaying = true;

        playInterval = setInterval(function () {
            var decodeLength = 40;
            if (isHup && (audioData.audioOffset + 1) * decodeLength > voiceBuffer.length) {
                sRecorder.stopPlay();
                return;
            }

            if ((audioData.audioOffset + 1) * decodeLength <= voiceBuffer.length) {
                var splVoice = voiceBuffer.slice(audioData.audioOffset * decodeLength, (audioData.audioOffset + 1) * decodeLength);
                //console.log(splVoice);

                //Array转Uint8Array
                var intVoice = new Uint8Array(splVoice.length);
                for (let i = 0; i < intVoice.length; i++) {
                    intVoice[i] = splVoice[i];
                }
                //console.log(intVoice);

                //speex解码
                var pcmBuffer = codec.decode(intVoice);
                //console.log(pcmBuffer);
                audioData.inputUseSaveBuffer(pcmBuffer);

                //pcm转wav
                var data = audioData.encodeWav(pcmBuffer);
                //console.log(data);

                //播放wav
                audioData.playWav(data);

                //偏移量递增
                audioData.audioOffset++;
            }
        }, 40)
    }

    //结束播放
    this.stopPlay = function () {
        window.clearInterval(playInterval);
        isPtt = false;
        isPlaying = false;
        voiceBuffer = [];
        audioData.audioOffset = 0;
        audioData.inputSaveBuffer(pttId);
        console.log("stop play");
    }
};

//获取麦克风权限
var SRecorder_get = function (callback) {
    if (callback) {
        if (navigator.getUserMedia) {
            navigator.getUserMedia({
                    audio: true
                },
                function (stream) {
                    var rec = new SRecorder(stream);
                    callback(rec);
                },
                function (error) {
                    alert("Not support microphones or no permissions!");
                })
        } else {
            alert("getUserMedia not supported");
        }
    }
}
SRecorder_get(function (rec) {
    console.log(rec)
    sRecorder = rec;
});