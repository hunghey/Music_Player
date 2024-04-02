const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = "f8_player_storage"

const player = $('.player');
const heading = $('header h2');
const cdThumb = $('.cd-thumb');
const audio = $('#audio');
const cd = $('.cd')
const playBtn = $('.btn-toggle-play');
const progress = $('#progress');
const nextBtn = $('.btn-next');
const prevBtn = $('.btn-prev');
const randomBtn = $('.btn-random');
const repeatBtn = $('.btn-repeat');
const playlist = $('.playlist');

const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    songs: [
        {
            name: '500 Miles',
            singer: 'Justin Timberlake',
            path: 'https://audio.jukehost.co.uk/60r5S2rNFQpCSnKirIGNlzveSs6klXAv',
            image: 'https://i1.sndcdn.com/artworks-000112928659-83o8mj-t500x500.jpg'
        },
        {
            name: 'Tiễn Em Lần Cuối',
            singer: 'Trung Hành',
            path: 'https://audio.jukehost.co.uk/aLNQRm4NYccoi6rXztg3ED2IiBBq7W5d',
            image: 'https://avatar-ex-swe.nixcdn.com/singer/avatar/2014/03/31/3/9/8/6/1396249140056_600.jpg'
        },
        {
            name: 'LK Người Tình Ngàn Dặm',
            singer: 'Ngọc Lan Trang',
            path: 'https://audio.jukehost.co.uk/LIAT2DoIiPbvxadiX6CdtPeuh8mWk7Ol',
            image: 'https://images2.thanhnien.vn/zoom/700_438/528068263637045248/2023/7/9/ngoc-lan-trang-1688897249072488991546-216-0-1069-1364-crop-1688897495755158013134.jpeg'
        },
        {
            name: 'Self Control',
            singer: 'Laura Branigan',
            path: 'https://audio.jukehost.co.uk/QdT6rBnVGgliy48Hw6u8UrjgyNkHzUgo',
            image: 'https://www.djprince.no/covers/laura.jpg'
        },
        {
            name: 'Cheri Cheri Lady',
            singer: 'Modern Talking',
            path: 'https://audio.jukehost.co.uk/G3UvJpmWYX90v2YJaZvAnk7AvFxv7576',
            image: 'https://photo-resize-zmp3.zmdcdn.me/w320_r1x1_jpeg/cover/c/a/b/5/cab58a4408a7c356d5db85b1fa31487f.jpg'
        },
        {
            name: 'Brother Louie',
            singer: 'Modern Talking',
            path: 'https://audio.jukehost.co.uk/nl1jkex593GkE0fhRh1BkJqaexRBmmER',
            image: 'https://photo-resize-zmp3.zmdcdn.me/w320_r1x1_jpeg/cover/c/a/b/5/cab58a4408a7c356d5db85b1fa31487f.jpg'
        },
        {
            name: 'You are My Heart, You are My Soul',
            singer: 'Modern Talking',
            path: 'https://audio.jukehost.co.uk/Ov9BVMZmWRW8Vs54pZZqf48baFBvhdmt',
            image: 'https://photo-resize-zmp3.zmdcdn.me/w320_r1x1_jpeg/cover/c/a/b/5/cab58a4408a7c356d5db85b1fa31487f.jpg'
        }
    ],
    setConfig: function (key, value) {
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
    },
    render: function () {
        const htmls = this.songs.map((song, index) => {
            return `
                <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index="${index}">
                    <div class="thumb" style="background-image: url('${song.image}');">
                    </div>
                    <div class="body">
                        <h3 class="title">${song.name}</h3>
                        <p class="author">${song.singer}</p>
                    </div>
                </div>
                `
        })
        playlist.innerHTML = htmls.join('')
    },
    defineProperties: function () {
        Object.defineProperty(this, 'currentSong', {
            get: function () {
                return this.songs[this.currentIndex]
            }
        })
    },
    handleEvent: function () {
        const _this = this
        const cdWith = cd.offsetWidth;

        const cdThumbAnimate = cdThumb.animate([{
            transform: 'rotate(360deg)'
        }], {
            duration: 10000,
            iterations: Infinity,
        })

        cdThumbAnimate.pause();


        document.onscroll = function () {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const newCdWidth = cdWith - scrollTop;

            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0
            cd.style.opacity = newCdWidth / cdWith
        }

        playBtn.onclick = function () {
            if (_this.isPlaying) {
                audio.pause();
            } else {
                audio.play();
            }
        }

        audio.onplay = function () {
            _this.isPlaying = true;
            player.classList.add('playing');
            cdThumbAnimate.play();
        }

        audio.onpause = function () {
            _this.isPlaying = false;
            player.classList.remove('playing');
            cdThumbAnimate.pause();
        }

        audio.ontimeupdate = function () {
            if (audio.duration) {
                const progressCurrent = Math.floor(audio.currentTime / audio.duration * 100)
                progress.value = progressCurrent
            }
        }

        progress.oninput = function (e) {
            const seekTime = audio.duration / 100 * e.target.value
            audio.currentTime = seekTime;
        }

        nextBtn.onclick = function () {
            if (_this.isRandom) {
                _this.randomSong();
            } else {
                _this.nextSong();
            }
            audio.play();
            _this.render();
            _this.scrollToActiveSong();
        }

        prevBtn.onclick = function () {
            if (_this.isRandom) {
                _this.randomSong();
            } else {
                _this.prevSong();
            }
            audio.play();
            _this.render();
            _this.scrollToActiveSong();
        }

        randomBtn.onclick = function () {
            _this.isRandom = !_this.isRandom
            _this.setConfig('isRandom', _this.isRandom)
            randomBtn.classList.toggle('active', _this.isRandom);
        }

        audio.onended = function () {
            if (_this.isRepeat) {
                audio.play();
            } else {
                nextBtn.click();
            }
        }

        playlist.onclick = function (e) {
            const songNode = e.target.closest('.song:not(.active)');
            if (songNode || e.target.closest('.option')) {
                if (songNode) {
                    _this.currentIndex = Number(songNode.dataset.index)
                    _this.loadCurrentSong()
                    _this.render();
                    audio.play();
                }
                if (e.target.closest('option')) {

                }

            }
        }

        repeatBtn.onclick = function () {
            _this.isRepeat = !_this.isRepeat;
            _this.setConfig('isRepeat', _this.isRepeat)
            repeatBtn.classList.toggle('active', _this.isRepeat);
        }
    },

    loadCurrentSong: function () {
        heading.textContent = this.currentSong.name;
        cdThumb.style.backgroundImage = `url(${this.currentSong.image})`;
        audio.src = this.currentSong.path;
    },

    loadConfig: function () {
        this.isRandom = this.config.isRandom;
        this.isRepeat = this.config.isRepeat;
    },

    nextSong: function () {
        this.currentIndex++;
        if (this.currentIndex >= this.songs.length) {
            this.currentIndex = 0
        }
        this.loadCurrentSong()
    },

    prevSong: function () {
        this.currentIndex--;
        if (this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1
        }
        this.loadCurrentSong()
    },

    randomSong: function () {
        let newIndex
        do {
            newIndex = Math.floor(Math.random() * this.songs.length)
        } while (newIndex === this.currentIndex)
        this.currentIndex = newIndex
        this.loadCurrentSong()
    },

    scrollToActiveSong: function () {
        setTimeout(() => {
            $('.song-active').scrollIntoView({
                behavior: 'smooth',
                block: 'center',
                inline: 'center'
            })
        }, 500)
    },

    start: function () {
        this.loadConfig();
        this.defineProperties();
        this.handleEvent();
        this.loadCurrentSong();
        this.render();

        repeatBtn.classList.toggle('active', this.isRepeat);
        randomBtn.classList.toggle('active', this.isRandom);
    }
}
app.start();