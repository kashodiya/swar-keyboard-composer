let dbHelper;
const keys = "C#3 D3 D#3 E3 F3 F#3 G3 G#3 A3 A#3 B3 C4 C#4 D4 D#4 E4 F4 F#4 G4 G#4 A4 A#4 B4 C5 C#5 D5 D#5 E5 F5 F#5 G5 G#5 A5 A#5 B5 C6".split(" ");
const swars = "sl Rl rl Gl gl ml Ml pl Dl dl Nl nl s R r G g m M p D d N n su Ru ru Gu gu mu Mu pu Du du Nu nu".split(" ");
const swarsEng = ".S .r .R .g .G .M .m .P .d .D .n .N S r R g G M m P d D n N S. r. R. g. G. M. m. P. d. D. n. N.".split(" ");
// const colors = ['#e6194B', '#3cb44b', '#ffe119', '#4363d8', '#f58231', '#911eb4', '#42d4f4', '#f032e6', '#bfef45', '#fabed4', '#469990', '#dcbeff', '#9A6324', '#fffac8', '#800000', '#aaffc3', '#808000', '#ffd8b1', '#000075', '#a9a9a9', '#ffffff', '#000000'];
const oneOctive = ['black cs', 'white d', 'black ds', 'white e', 'white f', 'black fs', 'white g', 'black gs', 'white a', 'black as', 'white b', 'white c'];
const pianoKeys = [...oneOctive, ...oneOctive, ...oneOctive];

const SwarEdit = Vue.component('Swaredit', {
    template: '#swaredit-template',
    props: ['context', 'tabIndex'],
    //'swarTxt', 'name', , 
    data() {
        return {
            showGuide: false,
            showFormatSwars: false,
            projectNameOld: '',
            dbRecord: null,
            projectName: '',
            rules: {
                required: value => !!value || 'Please enter download file name.'
            },
            allowLyricsLines: false,
            formattedSwars: '',
            omeClassName: 'ome-bhatkhande-english',
            swarLineBitsGapIncrement: 2,
            swarLines: [],      //This is a used for drawing preview table
            omeClassNames: [
                { className: 'ome-bhatkhande-english', title: 'English' },
                { className: 'ome-bhatkhande-hindi', title: 'Hindi' },
                { className: 'ome-bhatkhande-punjabi', title: 'Punjabi' },
                { className: 'ome-swarlipi', title: 'Swarlipi' }
            ],

        }
    },
    watch: {
        allowLyricsLines() {
            this.transformFromattedSwars();
            // formattedSwars(this.formattedSwars);
        },
        formattedSwars(newTxt) {
            this.transformFromattedSwars();
        },
        // projectName(newName, oldName) {
        //     console.log({newName, oldName});
        // }
    },
    methods: {
        projectNameBlur() {
            if (this.projectName.length > 0 && this.projectName != this.projectNameOld) {
                console.log(`Change db record key from ${this.projectName} to ${this.projectNameOld}`);
                this.saveRecord();
            }
        },
        transformFromattedSwars() {
            if (this.formattedSwars == null || this.formattedSwars.length == 0) return;

            let lines = this.formattedSwars.split('\n');
            // console.log({ lines });
            lines = lines.filter(l => l.trim().length != '')

            this.swarLines = [];
            lines.forEach((line, lineIndex) => {
                let vibhagList = [];
                let vibhags = line.split('|');
                vibhags.forEach(vibhag => {
                    let bits = vibhag.trim().split(' ').map(b => {
                        let isOmenad = true;
                        let symbol = b;
                        if (b == '=') {
                            symbol = '~';
                            // symbol = '&#864;';
                            isOmenad = false;
                        } else if (b == '-') {
                            symbol = '';
                            isOmenad = false;
                        } else if (this.allowLyricsLines && lineIndex % 2 == 0) {
                            isOmenad = false;
                        }
                        return { symbol, isOmenad };
                    });
                    vibhagList.push(bits);
                });
                this.swarLines.push(vibhagList);
            });
            let maxCol = Math.max(...this.swarLines.map(l => l.length));
            // console.log({ maxCol, swarLines: this.swarLines });
        },
        adjustBitGap(amount) {
            let maxWidth = 0;
            this.swarLines.forEach((line, lineIndex) => {
                line.forEach((vibhag, vibhagIndex) => {
                    vibhag.forEach((bit, bitIndex) => {
                        let refId = 'bit-' + lineIndex + '-' + vibhagIndex + '-' + bitIndex;
                        let width = this.$refs[refId][0].offsetWidth;
                        // console.log({refId, width});
                        if (width > maxWidth) maxWidth = width;
                    });
                });
            });

            this.swarLines.forEach((line, lineIndex) => {
                line.forEach((vibhag, vibhagIndex) => {
                    vibhag.forEach((bit, bitIndex) => {
                        let refId = 'bit-' + lineIndex + '-' + vibhagIndex + '-' + bitIndex;
                        this.$refs[refId][0].style.width = maxWidth + amount + 'px';
                    });
                });
            });

        },
        async createPDF() {
            let table = this.$refs['swar-line-preview-table'];
            var doc = new jspdf.jsPDF();

            //URLs of TTF file are in: https://webfonts.omenad.net/fonts.css


            let fontBlob = await fetch('https://webfonts.omenad.net/webfontkit/omebhatkhandeenglish-webfont.ttf').then(r => r.blob());


            var binaryStringToUint8Array = function (binary_string) {
                var len = binary_string.length;
                var bytes = new Uint8Array(len);
                for (var i = 0; i < len; i++) {
                    bytes[i] = binary_string.charCodeAt(i);
                }
                return bytes;
            };

            const reader = new FileReader();
            let fontBin = reader.readAsDataURL(fontBlob);
            doc.addFileToVFS("ome_bhatkhande_english", binaryStringToUint8Array(fontBlob));
            doc.addFont("omebhatkhandeenglish-webfont.ttf", "ome_bhatkhande_english", "normal");
            doc.setFont("ome_bhatkhande_english");


            // const myFont = ... // load the *.ttf font file as binary string
            // add the font to jsPDF
            // doc.addFileToVFS("MyFont.ttf", myFont);
            // doc.addFont("MyFont.ttf", "MyFont", "normal");
            // doc.setFont("MyFont");

            doc.html(table, {
                callback: function (doc) {
                    doc.save();
                },
                x: 10,
                y: 10
            });
        },
        saveRecord(download) {
            let zip = new JSZip();
            zip.file(this.projectName + '-formatted-swars.txt', this.formattedSwars);
            zip.file(this.projectName + '-preview.html', 'TODO: THIS FILE SHOULD INCLUDE HTML OF THE TABLE');

            zip.generateAsync({ type: "blob" }).then(async (zipBlob) => {
                let fileName = this.projectName + '.zip';
                if (download) {
                    saveAs(zipBlob, fileName);
                }
                //Save to db
                let record = { name: this.projectName, fileName, type: 'Editors', zipBlob };
                if (this.projectNameOld == this.projectName) {
                    await dbHelper.saveRecord(record);
                } else {
                    await dbHelper.saveRecord(record, this.projectNameOld);
                    this.projectNameOld = this.projectName;
                    this.$router.app.$emit('onRenameTab', { tabIndex: this.tabIndex, name: this.projectName });
                }
                this.dbRecord = record;
            });
        },
    },
    mounted() {
    },
    async created() {

        if (this.context) {
            console.log('SwarEdit created with context = ', this.context);
            this.projectName = this.context.name;
            if (this.context.type == 'Recordings') {
                //When SwarEditor is called from Recordings, we need to get swarTxt from <name>-swarTimeData.json file from zipBlob 
                let files = await unzip(this.context.zipBlob);
                console.log({ files });

                // let swarTimeDataFileInfo = files.find(f => f.fileName.indexOf('-swarTimeData.json') > -1);
                // if(swarTimeDataFileInfo){
                //     let swarTimeData = swarTimeDataFileInfo.content;
                //     this.swarTxt = swarTimeData.map(d => d.swar).join(' ');
                // }else{
                //     console.error('Rcording context passed to SwarExit does not have *-swarTimeData.json in the zipBlob');
                // }

                let swarFileInfo = files.find(f => f.fileName.indexOf('-omenad-swars.txt') > -1);
                if (swarFileInfo) {
                    this.swarTxt = swarFileInfo.content;
                } else {
                    console.error('Rcording context passed to SwarExit does not have *-omenad-swars.txt in the zipBlob');
                }
            } else if (this.context.type == 'Players') {
                //swarTxt is in the context
                this.swarTxt = this.context.swarTxt;
            }
            this.formattedSwars = this.swarTxt;
        } else {
            this.formattedSwars = '';
        }

        // this.formattedSwars = this.swarTxt;
        // console.log({ swarTxt: this.swarTxt });

        //TODO: Remove following block
        if (!this.formattedSwars || this.formattedSwars == '') {
            this.allowLyricsLines = true;
            this.formattedSwars =
                ["- - - - | - - - - | sa da gu ru",
                    "s r g m | r g m p | g m p d",
                    "se = = = | kya = maan gu | ji na ke =",
                    "r g m p | s r g m | g m p d"].join('\n');

            // this.allowLyricsLines = true;
            // this.formattedSwars ='a a | b b | c c | d d | e e\n1 1 | 2 2 | 2 2 | 4 4 | 5 5';

        }

        //If name as passed (from recorder/player), set title and save
        if (this.projectName && this.projectName.length > 0) {
            this.$router.app.$emit('onRenameTab', { tabIndex: this.tabIndex, name: this.projectName });
            // this.createZip(false);
            // await this.saveRecord();
        }

        this.projectNameOld = this.projectName;

        console.log('SwarEdit created');
    }
})

const Player = Vue.component('Player', {
    template: '#player-template',
    props: ['tabIndex', 'context'],     //Context can be an object comeing from Recordings tab OR a record from the DB
    data() {
        return {
            tickInterval: 500,
            fileName: '',
            name: '',
            timers: [],
            timer: null,
            audioDuration: 0,
            chosenFile: null,
            swarTimeData: null,
            elapsedTime: 0,
            pianoKeysInUse: [],
            minSwarIndex: -1,
            maxSwarIndex: -1,
            pianoKeys, swars, keys       //These come from global vars
        }
    },
    watch: {
        chosenFile() {
            this.readChosenFile();
        },
    },
    methods: {
        openFormatSwars() {
            let swarTxt = this.swarTimeData.map(d => d.swar).join(' ');
            this.$router.app.$emit('onAddNewSwarEdit', { swarTxt, name: this.name + '-swars', type: 'Players' });
            // console.log({ show });
        },
        swarTimeDataItemClicked(d) {
            // console.log({ swarData: d });
            this.$refs['piano-key-' + d.keyIndex][0].classList.add('active-key');
            setTimeout(() => {
                this.$refs['piano-key-' + d.keyIndex][0].classList.remove('active-key');
            }, d.duration);
        },
        preparePiano() {
            //pianoKeys
            if (this.swarTimeData.length == 0) {
                console.log('Not rendereing Piano because there are no swars in the swarTimeData');
                return;
            }

            let indexes = this.swarTimeData.map(d => {
                d.swarIndex = this.swars.indexOf(d.swar);
                return d.swarIndex;
            });
            this.minSwarIndex = Math.min.apply(Math, indexes);
            this.maxSwarIndex = Math.max.apply(Math, indexes);

            if (this.pianoKeys[this.minSwarIndex].indexOf('black') > -1) {
                console.log('Showing one white key to the left of the piano');
                this.minSwarIndex--;
            }
            if (this.pianoKeys[this.maxSwarIndex].indexOf('black') > -1) {
                console.log('Showing one white key to the right of the piano');
                this.maxSwarIndex++;
            }

            let wKeyCount = 0;
            let bKeyCount = 0;
            for (let i = this.minSwarIndex; i <= this.maxSwarIndex; i++) {
                let notUsed = this.swarTimeData.findIndex(d => d.keyIndex == i) == -1;
                this.pianoKeysInUse.push({
                    keyIndex: i,
                    swar: this.swars[i],
                    liClass: this.pianoKeys[i],
                    notUsed
                })
                if (this.pianoKeys[i].indexOf('white') > -1) wKeyCount++;
                if (this.pianoKeys[i].indexOf('black') > -1) bKeyCount++;
            }
            //TODO: Following 2.4 is a by trial and error, find out better way
            let pianoWidth = (wKeyCount * 2.8) + (bKeyCount * 2);
            console.log({ wKeyCount, bKeyCount, pianoWidth });
            this.$refs.pianoKeys.style.width = pianoWidth + 'em';
        },
        async loadZipFile(zipBlob, origFileName) {
            let files = await unzip(zipBlob);
            console.log({ files });
            files.forEach(fileInfo => {
                if (fileInfo.ext == 'ogg') {
                    //audio/ogg; codecs=opus
                    this.$refs.playerAudio.src = window.URL.createObjectURL(fileInfo.content);
                } else if (fileInfo.ext == 'json') {
                    this.swarTimeData = fileInfo.content;
                    console.table(this.swarTimeData.map(d => { return { st: d.startTime, et: d.endTime, swar: d.swar } }));
                    this.preparePiano();
                }
            });

            if (this.context && this.context.type == "Recordings") {           //This tab is opened by Recordings tab or a db record of it
                console.log('Because the context is a Recording record. Skipping the DB save.')
                this.$router.app.$emit('onRenameTab', { tabIndex: this.tabIndex, name: this.context.name });
            } else {
                if (this.context) {
                    // fileName = this.context.name;
                } else {
                    let fileName = this.chosenFile.name;

                    // fileName = origFileName;
                    let name = fileName.replace(/\.[^/.]+$/, "");
                    // let record = { type: 'Players', name, fileName, createdDate: new Date(), arrayBuffer: ev.target.result };
                    let record = { type: 'Players', name, fileName, zipBlob };
                    await dbHelper.saveRecord(record);
                    this.fileName = fileName;
                    this.name = name;
                    this.$router.app.$emit('onRenameTab', { tabIndex: this.tabIndex, name });

                }
            }
        },
        readChosenFile() {
            if (!this.chosenFile) {
                this.data = "No File Chosen";
                //TODO: Show this err to user?
                return;
            };
            console.log("Reading uploaded file...");
            var reader = new FileReader();
            reader.onload = (ev) => {
                this.loadZipFile(ev.target.result);
            };
            reader.onerror = function (err) {
                console.error("Failed to read file", err);
            }
            // const arrayBuffer = reader.readAsArrayBuffer(this.chosenFile);
            reader.readAsArrayBuffer(this.chosenFile);
        },
        clearSwarHighlights() {
            this.swarTimeData.forEach((d, i) => {
                d.visited = false;
                this.$refs['player-swar-' + i][0].classList.remove('current-swar');
            });
        },
        clearAllTimers() {
            this.timers.forEach(t => {
                clearTimeout(t);
            });
        },
        audioPlaying() {
            console.log('onPlaying...');

            this.clearAllTimers();

            //Create setTimeout for each bit
            this.timers = [];
            // let triggerTime = 0;
            this.clearSwarHighlights();
            let audioPlayerTime = this.$refs.playerAudio.currentTime * 1000;
            console.log({ audioPlayerTime });
            this.swarTimeData.forEach((d, index) => {
                if (d.startTime < audioPlayerTime) {
                    console.log({ s: 'SKIPP', index, swar: d.swar, dur: d.duration });
                    return;
                };

                let triggerTime = d.startTime - audioPlayerTime;
                // triggerTime += d.startTime;
                let timer = setTimeout((() => {
                    //Set swarTimeDataItem as memory for setTimeout callback
                    let swarTimeDataItem = d;
                    return () => {
                        console.log({ index, swar: d.swar, dur: d.duration, triggerTime });

                        let keyIndex = swarTimeDataItem.keyIndex;
                        let duration = swarTimeDataItem.duration;
                        this.$refs['piano-key-' + keyIndex][0].classList.add('active-key');
                        setTimeout(() => {
                            this.$refs['piano-key-' + keyIndex][0].classList.remove('active-key');
                        }, d.duration);

                        this.$refs['player-swar-' + index][0].classList.add('current-swar');
                        // swarTimeDataItem.visited = true;
                    }
                })(), triggerTime);
                this.timers.push(timer);
            });
        },
        audioPaused() {
            console.log('audioPaused...');
            this.clearAllTimers();
            clearInterval(this.timer);
            // this.stopAnim();
        },
        audioEnded() {
            console.log('audioEnded...');
            clearInterval(this.timer);
            // this.stopAnim();
            this.prevSwarIndex = -1;
        },
        audioSeeking(e) {
            // console.log('audioSeeking...', this.$refs.playerAudio.currentTime);
            // this.onTick();
        },
    },
    mounted() {
        let audio = this.$refs.playerAudio;
        audio.addEventListener('playing', this.audioPlaying);
        audio.addEventListener('pause', this.audioPaused);
        audio.addEventListener('ended', this.audioEnded);
        audio.addEventListener('seeking', this.audioSeeking);
        if (this.context != null) {
            console.log('Player created with context =');
            console.log(this.context);
            this.name = this.context.fileName;
            this.loadZipFile(this.context.zipBlob, this.context.fileName);
        }
    },
    created() {
        console.log('Player created');
    }
})

// https://drive.google.com/file/d/1Ek5u5mQ0Kz5JklUX_uziUSV2jnJ7JnD0/view?usp=sharing


const Recorder = Vue.component('Recorder', {
    template: '#recorder-template',
    props: ['tabIndex'],
    data() {
        return {
            dbRecord: null,
            audioDataReady: false,
            rules: {
                required: value => !!value || 'Please enter download file name.'
            },
            recState: 'NOT-RECORDING',
            deviceId: '',
            deviceName: '',
            mediaRecorderCreated: false,
            recStartDateTime: null,
            swarTimeData: [],
            projectNameOld: '',
            projectName: '',
            pianoKeyDownInfo: null,
            keys, swars, swarsEng            //These come from global vars
        }
    },
    methods: {
        projectNameBlur() {
            if (this.projectName.length > 0 && this.projectName != this.projectNameOld) {
                console.log(`Change db record key from ${this.projectName} to ${this.projectNameOld}`);
                if (this.dbRecord) {
                    //If record was saved, rename the key
                    this.saveRecord();
                }
            }
        },
        async openInPlayer() {
            let name = this.getFileName();
            if (!name) return;

            // let zipBlob = await this.getZipBlob();
            // let fileName = name + '.zip';
            // this.$router.app.$emit('onAddNewPlayer', { zipBlob, name, fileName });




            // Get the record from DB of this recording
            // let context = await dbHelper.getByName('Recordings', name);
            // this.$router.app.$emit('onAddNewPlayer', context);

            this.$router.app.$emit('onAddNewPlayer', this.dbRecord);


            // console.log('Conpare this:', {zipBlobFromDB: context.zipBlob, zipBlob});
            // console.log('UNZIP of zipBlobFromDB');
            // await unzip(context.zipBlob);
            // console.log('UNZIP of zipBlob');
            // await unzip(zipBlob);

        },
        async openInSwarEditor() {
            let name = this.getFileName();
            if (!name) return;
            // let zipBlob = await this.getZipBlob();
            // let fileName = name + '.zip';

            let context = await dbHelper.getByName('Recordings', name);
            this.$router.app.$emit('onAddNewSwarEdit', context);
        },
        generateProjectName() {
            return getFileNameFromDate();
            // const date = new Date();
            // var fileName = date.getFullYear() + '-'
            //     + ('0' + (date.getMonth() + 1)).slice(-2) + '-'
            //     + ('0' + date.getDate()).slice(-2) + '-'
            //     + ('0' + date.getHours()).slice(-2) + '-'
            //     + ('0' + date.getMinutes()).slice(-2) + '-'
            //     + ('0' + date.getSeconds()).slice(-2);
            // return fileName;
        },
        getFileName() {     //Returns false or string
            this.$refs.form.validate();
            if (this.projectName == '') {
                // this.message = "Please enter file name";
                // this.showMesssage = true;
                this.$router.app.$emit('onShowMessage', 'Please enter file name');
                return false;
            }
            return this.projectName;
        },
        download() {
            let name = this.getFileName();
            if (!name) return;
            // let content = await this.getZipBlob();
            let content = this.dbRecord.zipBlob;
            let fileName = name + '.zip';
            saveAs(content, fileName);
            // await this.saveRecord();
            this.projectNameOld = name;
        },
        async getZipBlob() {
            let swarList = this.swarTimeData.map(d => d.swar);
            let swarEngList = this.swarTimeData.map(d => this.swarsEng[d.keyIndex]);
            let plainSwarTimeData = this.swarTimeData.map(d => {
                let { duration, startTime, endTime, keyIndex, swar } = d;
                return { duration, startTime, endTime, keyIndex, swar };
            });

            // let zip = this.$options.zip;
            let zip = new JSZip();
            zip.file(this.projectName + '-swarTimeData.json', JSON.stringify(plainSwarTimeData));
            zip.file(this.projectName + '-omenad-swars.txt', swarList.join(' '));
            zip.file(this.projectName + '-eng-swars.txt', swarEngList.join(' '));
            zip.file(this.projectName + '-audio.ogg', this.$options.audioBlob, { base64: true });

            let content = await zip.generateAsync({ type: "blob" });
            return content;
        },
        clearAll() {
            this.$options.zip = new JSZip();
            this.$options.chunks = [];
            this.$refs.recordingAudio.src = '';
            this.swarTimeData = [];
            this.audioDataReady = false;
            this.recState = 'NOT-RECORDING';
            this.recStartDateTime = null;
            this.projectName = this.generateProjectName();
            // this.projectNameOld = '';
            this.projectName = this.generateProjectName();
        },
        swarTimeDataItemClicked(d) {
            console.log({ swarTimeDataItem: d });
            // console.table(this.swarTimeData);
        },
        async stopRecording() {
            let mediaRecorder = this.$options.mediaRecorder;
            mediaRecorder.stop();
            this.recState = 'STOPPED';
            this.calculateSwarTimes();
            console.table(this.swarTimeData.map(d => { return { st: d.startTime, et: d.endTime, swar: d.swar } }));
            // await this.saveRecord();
        },
        async saveRecord() {
            let name = this.getFileName();
            if (!name) return;
            let zipBlob = await this.getZipBlob();
            let fileName = name + '.zip';
            // let arrayBuffer = await blob.arrayBuffer();
            let record = { type: 'Recordings', name, fileName, zipBlob };
            if (this.projectNameOld.length > 0 && name != this.projectNameOld) {
                //Update record
                let oldKey = this.projectNameOld;
                await dbHelper.saveRecord(record, oldKey);
            } else {
                //Insert record
                await dbHelper.saveRecord(record);
            }
            this.$router.app.$emit('onShowMessage', `Recording data is saved under file name: ${fileName}`);
            this.projectNameOld = name;

            this.$router.app.$emit('onRenameTab', { tabIndex: this.tabIndex, name });
            this.dbRecord = record;
        },
        startRecording() {
            let chunks = this.$options.chunks;
            let mediaRecorder = this.$options.mediaRecorder;
            console.log('Using Media Recorder: ', mediaRecorder);
            // let recordingAudio = document.getElementById('recordingAudio');
            let recordingAudio = this.$refs.recordingAudio;
            console.log('Starting recording...for 4 sec...');
            mediaRecorder.start();
            this.recState = 'RECORDING';
            this.recStartDateTime = new Date();

            mediaRecorder.onstop = async (e) => {
                let chunks = this.$options.chunks;
                const blob = new Blob(chunks, { 'type': 'audio/ogg; codecs=opus' });
                this.$options.audioBlob = blob;
                chunks = [];
                const audioURL = window.URL.createObjectURL(blob);
                recordingAudio.src = audioURL;
                this.audioDataReady = true;
                await this.saveRecord();
            }
            mediaRecorder.ondataavailable = function (e) {
                console.log('Getting chunks...')
                chunks.push(e.data);
            }
        },
        calculateSwarTimes() {
            //Take recStartDateTime and iterate swarTimeData to set time and duration
            this.swarTimeData.forEach(d => {
                // debugger;
                d.startTime = d.startDateTime - this.recStartDateTime;
                d.duration = d.endDateTime - d.startDateTime;
                d.endTime = d.startTime + d.duration;
                // return {startTime, duration, swar: d.swar, keyIndex: d.keyIndex}
                // return {...d, startTime, duration}
            });
            // console.log(this.swarTimeData);
        },
        onMidiEnabled() {
            if (WebMidi.inputs.length < 1) {
                console.log('No MIDI device detected.');
                //TODO: Show this error
                // document.body.innerHTML += "No device detected.";
            } else {
                WebMidi.inputs.forEach((device, index) => {
                    this.deviceId = index;
                    this.deviceName = device.name;
                });
            }

            const mySynth = WebMidi.inputs[0];
            // const mySynth = WebMidi.getInputByName("TYPE NAME HERE!")

            mySynth.channels[1].addListener("noteoff", e => {
                if (this.recState != 'RECORDING') return;
                console.log('noteoff', e.note.number);
                let keyIndex = this.keys.indexOf(e.note.identifier);
                if (keyIndex != -1) {
                    let relatedNoteonData;
                    //We should iterate from the last element to fist one in swarTimeData
                    for (let i = this.swarTimeData.length - 1; i >= 0; i--) {
                        if (this.swarTimeData[i].keyIndex == keyIndex) {
                            relatedNoteonData = this.swarTimeData[i];
                            break;
                        }
                    }

                    if (relatedNoteonData) {
                        relatedNoteonData.endDateTime = new Date();
                    } else {
                        console.log('WAT!', keyIndex);
                    }
                } else {
                    //2 or more keys were pressed together so missed noteoff of previous key
                    console.log('WAT! keyIndex = -1, e.note.identifier = ' + e.note.identifier);
                }
            });

            mySynth.channels[1].addListener("noteon", e => {
                if (this.recState != 'RECORDING') return;
                console.log('noteon', e.note.number)
                let keyIndex = this.keys.indexOf(e.note.identifier);
                if (keyIndex != -1) {
                    this.swarTimeData.push({
                        duration: 0, startTime: 0, endTime: 0,     //Calcualted in the calculateSwarTimes()
                        keyIndex,
                        swar: swars[keyIndex],
                        // endDateTime:                             This will be set in noteoff event
                        startDateTime: new Date()
                    });
                } else {
                    console.log('Only keys from mandra, madhaya and taar saptak is recorded.');
                }
            });
            this.$options.mySynth = mySynth;
        },
    },
    created() {
        console.log('Recorder created');

        this.$options.chunks = [];
        this.$options.zip = new JSZip();
        const constraints = { audio: true };
        navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
            this.$options.mediaRecorder = new MediaRecorder(stream);
            this.mediaRecorderCreated = true;
            console.log('Media Recorder created');
        }, () => {
            console.log('Error getting: navigator.mediaDevices.getUserMedia');
        });
        this.projectName = this.generateProjectName();
        this.projectNameOld = this.projectName;

        WebMidi.enable().then(this.onMidiEnabled).catch(err => {
            //TODO: Show this error
            //this.$options.deviceName = err;
        }, true);

    },
    beforeDestroy() {
        console.log('Recorder beforeDestroy');
        this.$options.mySynth.removeListener();
    }
})


const Main = Vue.component('Main', {
    template: '#main-template',
    data: () => {
        return {
            showMesssage: false,
            message: '',
            curTab: null,
            // tabTitleIndex: 1,
            showFileDialog: false,
            showDeleteConfirmDialog: false,
            tabs: [
                {
                    title: 'Welcome',
                    type: 'welcome'
                }
            ],
            filesList: [],       //See createFilesList() from created()
            fileListHeaders: [
                { text: 'Type', value: 'type' },
                { text: 'Name', value: 'name' },
                { text: 'Created Date', value: 'createdDateStr' },
                { text: 'Actions', value: 'actions', sortable: false },
            ],
        }
    },
    methods: {
        async deleteRecordConfirmed() {
            // console.log('Deleting confirmed...', this.recordToBeDeleted);
            await this.deleteRecord(this.recordToBeDeleted);
            this.showDeleteConfirmDialog = false;
        },
        showDeleteConfirmDialogBox(record) {
            this.recordToBeDeleted = record;
            this.showDeleteConfirmDialog = true;
        },
        async fileTableRowClicked(row) {
            console.log({ row });
            if (row.zipBlob) {
                await unzip(row.zipBlob);
            }
        },
        async loadFilesListFromDB() {
            this.filesList = [];
            let rawData = await dbHelper.getAllData();
            rawData.forEach(d => {
                d.actions = 0;
                d.createdDateStr = getFormattedDate(d.createdDate);
            });

            this.filesList.push(...rawData);
            // console.log({ filesList: this.filesList });
        },
        addNewPlayer(context) {
            console.log('addNewPlayer called');
            // this.tabTitleIndex++;
            // let title = 'Play-' + this.tabTitleIndex;
            let title = getFileNameFromDate();
            if (context && context.name) title = context.name;
            this.tabs.push({ title, type: 'Players', context });
            this.curTab = this.tabs.length - 1;
        },
        addNewRecording() {
            console.log('addNewRecording called');
            // this.tabTitleIndex++;
            // let title = 'Rec-' + this.tabTitleIndex;
            let title = getFileNameFromDate();
            // if(context && context.name) title = context.name;
            this.tabs.push({ title, type: 'Recordings' });
            this.curTab = this.tabs.length - 1;
        },
        addNewSwarEdit(context) {
            console.log('addNewSwarEdit called: ', { context });
            // let title = 'SEdit-' + this.tabTitleIndex;
            let title = getFileNameFromDate();
            if (!context) {
                context = { name: title }
            } else if (context.type == 'Recordings') {
                //Need to open ths zip and get swarTxt in the context
            } else if (context.type == 'Players') {
                //swarTxt is in the context
            }
            // this.tabTitleIndex++;
            this.tabs.push({ title, type: 'Editors', context });
            this.curTab = this.tabs.length - 1;
        },
        listFiles() {
            this.loadFilesListFromDB();
            this.showFileDialog = true;
        },
        renameTab(info) {
            console.log('Renaming the tab: ', { info });
            this.tabs[info.tabIndex].title = info.name;
        },
        closeTab(tabIndex) {
            let refId = this.tabs[tabIndex].type + '-' + tabIndex;
            // console.log('Closing refid = ' + refId);
            let component = this.$refs[refId];
            // console.log(component[0]);
            component[0].$destroy();

            this.tabs.splice(tabIndex, 1);
            console.log('closeTab called...');
        },
        async deleteRecord(record) {
            await dbHelper.deleteRecord(record);
            console.log('Deleted...', { record });
            this.loadFilesListFromDB();
        },
        openTabForRecord(record) {
            console.log('Opening tab for...', { record });
            if (record.type == 'Editors') {
                this.addNewSwarEdit(record);
            } else if (record.type == 'Recordings') {
                this.addNewPlayer(record);
            } else if (record.type == 'Players') {
                this.addNewPlayer(record);
            }
            this.showFileDialog = false;
        },
        openShowMessage(msg) {
            this.message = msg;
            this.showMesssage = true;
        },
        async getGitHubBlobUrlForPath(owner, repo, path) {
            // Following will give you a JSON of all the files in Git repo
            let url = `https://api.github.com/repos/${owner}/${repo}/git/trees/main?recursive=1`;
            let data = await fetch(url).then(r => r.json());
            console.log({ url, data });
            let blobUrl;
            let treeItem = data.tree.find(t => t.path == path);
            if (treeItem) {
                blobUrl = treeItem.url;
            }
            return blobUrl;
        },
        async downloadGoogleDriveZipFile(link) {
            // googleDriveLink is like this...
            //https://drive.google.com/file/d/1NzoKWzASbL696Cw-XRicD-X1SSc5jnc5/view?usp=sharing
            // You should extract ID and generate this link for download/fetch
            //https://drive.google.com/uc?export=download&id=1NzoKWzASbL696Cw-XRicD-X1SSc5jnc5


//https://www.googleapis.com/drive/v3/files/1NzoKWzASbL696Cw-XRicD-X1SSc5jnc5

            let id = link.split('/')[5];
            let dlLink = "https://drive.google.com/uc?export=download&id=" + id;
            console.log({ dlLink });

            let options = {
                // mode: 'no-cors',
                // headers: {
                    'Access-Control-Allow-Origin': '*'
                // }
            }

            let zipBlob = await fetch(dlLink, options).then(r => r.blob());
            console.log(zipBlob);
            let zip = await JSZip.loadAsync(zipBlob);
            console.log(zip.files);
            let fileName = "TODO.zip";
            return {zip, fileName};
        },
        async downloadGithubZipFile(link) {
            //gitPermaLink is like https://github.com/kashodiya/raag-files/blob/3fdd550943223160244ce8fb4dbf17a00899b495/raags/maru-bihag/raam-aakar-bane-man-mera/raam-aakar-bane-man-mera-asthayee-1.zip
            //Get owner, repo and path from it
            let parts = link.split("/")
            let owner = parts[3];
            let repo = parts[4];
            let gitFilePath = parts.slice(7).join("/");
            //A path looks like this: "raags/maru-bihag/raam-aakar-bane-man-mera/raam-aakar-bane-man-mera-antra-1.zip"
            url = await this.getGitHubBlobUrlForPath(owner, repo, gitFilePath);
            console.log({ url, owner, repo, gitFilePath });
            let data = await fetch(url).then(r => r.json());
            console.log(data);
            let zip = await JSZip.loadAsync(data.content, { base64: true });
            console.log(zip.files);
            let fileName = parts[parts.length - 1];
            return {zip, fileName};
        },
        async downloadZipFileAndOpenInPlayer(link, source) {
            let zipObj, zip, fileName;
            if (source == 'github') {
                zipObj = await this.downloadGithubZipFile(link);
            } else if (source == 'drive.google') {
                zipObj = await this.downloadGoogleDriveZipFile(link);
            }
            zip = zipObj.zip
            fileName = zipObj.fileName;

            let zipBlob = await zip.generateAsync({ type: "blob" });
            // let fileName = parts[parts.length - 1];
            let name = fileName.replace(/\.[^/.]+$/, "");
            let record = { type: 'Recordings', name, fileName, zipBlob };

            console.log({ record });
            dbHelper.saveRecord(record);
            this.$router.app.$emit('onAddNewPlayer', record);
        },
        async XXXdownloadZipFileAndOpenInPlayer(gitPermaLink) {

            //Check if the URL contains "google" or "github"
            //Accordingly call downloadGithubZipFileAndOpenInPlayer or downloadGoogleDriveZipFileAndOpenInPlayer

            //gitPermaLink is like https://github.com/kashodiya/raag-files/blob/3fdd550943223160244ce8fb4dbf17a00899b495/raags/maru-bihag/raam-aakar-bane-man-mera/raam-aakar-bane-man-mera-asthayee-1.zip
            //Get owner, repo and path from it
            let parts = gitPermaLink.split("/")
            let owner = parts[3];
            let repo = parts[4];
            let gitFilePath = parts.slice(7).join("/");
            //A path looks like this: "raags/maru-bihag/raam-aakar-bane-man-mera/raam-aakar-bane-man-mera-antra-1.zip"
            url = await this.getGitHubBlobUrlForPath(owner, repo, gitFilePath);
            console.log({ url, owner, repo, gitFilePath });
            let data = await fetch(url).then(r => r.json());
            console.log(data);
            let zip = await JSZip.loadAsync(data.content, { base64: true });
            console.log(zip.files);

            let zipBlob = await zip.generateAsync({ type: "blob" });
            let fileName = parts[parts.length - 1];
            let name = fileName.replace(/\.[^/.]+$/, "");
            let record = { type: 'Recordings', name, fileName, zipBlob };

            console.log({ record });
            dbHelper.saveRecord(record);
            this.$router.app.$emit('onAddNewPlayer', record);
            //xxx


        }
    },
    mounted() {
        this.curTab = 0;
    },
    created() {
        this.loadFilesListFromDB();
        this.$router.app.$on('onAddNewRecording', this.addNewRecording);
        this.$router.app.$on('onAddNewPlayer', this.addNewPlayer);
        this.$router.app.$on('onAddNewSwarEdit', this.addNewSwarEdit);
        this.$router.app.$on('onListFiles', this.listFiles);
        this.$router.app.$on('onRenameTab', this.renameTab);
        this.$router.app.$on('onShowMessage', this.openShowMessage);

        //gitPermaLink=https://github.com/kashodiya/raag-files/blob/3fdd550943223160244ce8fb4dbf17a00899b495/raags/maru-bihag/raam-aakar-bane-man-mera/raam-aakar-bane-man-mera-asthayee-1.zip
        let sourceLink = this.$route.query.sourceLink;
        console.log('sourceLink = ', sourceLink);
        if (sourceLink) {
            // Test urls
            // ?sourceLink=https://drive.google.com/file/d/1NzoKWzASbL696Cw-XRicD-X1SSc5jnc5/view?usp=sharing
            // ?sourceLink=https://github.com/kashodiya/raag-files/blob/3fdd550943223160244ce8fb4dbf17a00899b495/raags/maru-bihag/raam-aakar-bane-man-mera/raam-aakar-bane-man-mera-asthayee-1.zip


            let source = '';
            if (sourceLink.indexOf('github') > -1) {
                source = 'github';
            } else if (sourceLink.indexOf('drive.google') > -1) {
                source = 'drive.google';
            }
            this.downloadZipFileAndOpenInPlayer(sourceLink, source);
        }

        console.log('Main created');
    }
})

// function getColorOfSwar(swar) {
//     let index = swars.indexOf(swar);
//     let colorIndex = index - minSwarIndex;
//     return colors[colorIndex];
// }

const Welcome = Vue.component('Welcome', {
    template: '#welcome-template',
    data() {
        return {
            bodyHTML: 'Loading...'
        }
    },
    methods: {
    },
    async mounted() {
        let welcomeMDtxt = await fetch('README.md').then(res => res.text());
        // console.log(welcomeMDtxt);
        this.bodyHTML = marked.parse(welcomeMDtxt);
    },
    created() {
        console.log('Welcome created');
    }
})

// const Bar = Vue.component('Bar-Page', {
//     template: '#bar-template',
//     data() {
//         return {
//             state: store.state
//         }
//     },
//     methods: {
//     },
//     created() {
//         console.log('Bar created');
//     }
// })

function initVue() {

    const routes = [
        { path: '/', component: Main },
    ]

    const router = new VueRouter({
        routes // short for `routes: routes`
    })

    vm = new Vue({
        el: '#app',
        router,
        vuetify: new Vuetify(),
        methods: {
            addNewRecording() {
                console.log('Emitting addNewRecording...');
                this.$router.app.$emit('onAddNewRecording');
            },
            addNewPlayer() {
                console.log('Emitting addNewPlayer...');
                this.$router.app.$emit('onAddNewPlayer');
            },
            addNewSwarEdit() {
                console.log('Emitting addNewSwarEdit...');
                this.$router.app.$emit('onAddNewSwarEdit', '');
            },
            listFiles() {
                console.log('Emitting listFiles...');
                this.$router.app.$emit('onListFiles', '');
            }
        },
        mounted() {
            // this.addNewRecording();
            // this.addNewPlayer();
            // this.addNewSwarEdit();
        }
    })
}

async function init() {
    // loadServiceWorker();
    await initDB();
    initVue();
    // createPDF();
}



async function initDB() {
    let dbName = 'composer-db';
    let storeNames = ['Players', 'Editors', 'Recordings'];
    let db = await idb.openDB(dbName, 1, {
        upgrade(db) {
            db.createObjectStore(storeNames[0]);
            db.createObjectStore(storeNames[1]);
            db.createObjectStore(storeNames[2]);
        },
    });
    console.log('DB is connected');

    dbHelper = {
        saveRecord: async (record, oldKey) => {
            record.createdDate = new Date();
            console.log('Saving record...', record);
            await db.put(record.type, record, record.name);
            if (oldKey) {
                console.log('Deleting old key: ', oldKey);
                await db.delete(record.type, oldKey);
            }
        },

        getByName: async (storeName, name) => {
            return await db.get(storeName, name);
        },

        getAllData: async () => {
            let allData = [];
            for (const storeName of storeNames) {
                let data = await db.getAll(storeName);
                data.forEach(d => {
                    d.type = storeName;
                });
                // console.log({ data });
                allData = [...allData, ...data];
            }
            // console.log({ allData });
            return allData;
        },

        deleteRecord: async (record) => {
            await db.delete(record.type, record.name);
        },
    }
    console.log('dbHelper is ready');
}



(async () => {
    init();
})();


async function unzip(zipBlob) {
    let zip = await JSZip.loadAsync(zipBlob);
    var re = /(?:\.([^.]+))?$/;
    let files = [];
    console.log({ zip });
    for (var fileName of Object.keys(zip.files)) {
        console.log(fileName);
        var ext = re.exec(fileName)[1];
        if (ext == 'ogg') {
            let audioData = await zip.file(fileName).async("ArrayBuffer")
            // const blob = new Blob([audioData], { type: "audio/wav" });
            const blob = new Blob([audioData], { type: "audio/ogg" });
            // const blob = new Blob([audioData]);
            // audio/ogg; codecs=opus
            console.log('Successfully got audio from zip file.');
            files.push({ fileName, ext, content: blob });
        } else if (ext == 'json') {
            let jsonTxt = await zip.file(fileName).async("text");
            files.push({ fileName, ext, content: JSON.parse(jsonTxt) });
            console.log('Successfully got JSON content.');
        } else {  //This handles .txt and .html etc. files
            let content = await zip.file(fileName).async("text");
            files.push({ fileName, ext, content });
            console.log('Successfully got text content.');
        }
    }
    return files;
}

function getFileNameFromDate() {
    const date = new Date();
    var fileName = date.getFullYear() + '-'
        + ('0' + (date.getMonth() + 1)).slice(-2) + '-'
        + ('0' + date.getDate()).slice(-2) + '-'
        + ('0' + date.getHours()).slice(-2) + '-'
        + ('0' + date.getMinutes()).slice(-2) + '-'
        + ('0' + date.getSeconds()).slice(-2);
    return fileName;
}


function getFormattedDate(date) {
    var year = date.getFullYear();

    var month = (1 + date.getMonth()).toString();
    month = month.length > 1 ? month : '0' + month;

    var day = date.getDate().toString();
    day = day.length > 1 ? day : '0' + day;

    return month + '/' + day + '/' + year;
}
