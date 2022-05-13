// lib
async function fetchingData(url) {
    try {
        const res = await fetch(url);
        const data = await res.json();
    
        return data;
    } catch(e) {
        throw e;
    }
}


function setLoading(status) {
    const eleLoading = document.querySelector("#Loading");

    if(status) {
        eleLoading.style.display = 'fixed';
    } else {
        eleLoading.style.display = 'none';
    }
}



class Gallery {
    constructor() {
        this._instance = null
        
        this._selectCity = null
        this._selectTown = null
    }

    async init() {
        setLoading(true)

        const datas = await fetchingData("https://data.coa.gov.tw/Service/OpenData/ODwsv/ODwsvTravelFood.aspx")

        setLoading(false)
        
        this.datas = this.handleDatas(datas)

        this.setSelectUI()
        this.setGalleryUI()
    }

    handleDatas(datas) {
        let obj = {}

        datas.forEach((item)=>{
            if(obj[item.City]) {
                if(obj[item.City][item.Town]) {
                    obj[item.City][item.Town].push(item)
                } else {
                    obj[item.City][item.Town] = []
                    obj[item.City][item.Town].push(item)
                }
            } else {
                obj[item.City] = {}
                obj[item.City][item.Town] = []
                obj[item.City][item.Town].push(item)
            }
        })

        return obj
    }

    setSelectUI() {
        const eleSelectCity = document.querySelector('#SelectCity')
        const eleSelectTown = document.querySelector('#SelectTown')
        
        eleSelectCity.innerHTML = `<option selected="true" disabled>請選擇行政區...</option>`

        // composite element into eleSelectCity
        const cityItems = Object.keys(this.datas)
        eleSelectCity.innerHTML += this.makeTemplateString(selectTemplate,cityItems)

        eleSelectTown.innerHTML = `<option selected="true" disabled>請選擇鄉鎮區...</option>`

        let that = this
        eleSelectCity.addEventListener('change',function() {
            const townItems = Object.keys(that.datas[this.value])

            if(!townItems) {
                return     
            }

            // clear old datas
            eleSelectTown.innerHTML = `<option selected="true" disabled>請選擇鄉鎮區...</option>`
            
            // composite element into eleSelectCity
            eleSelectTown.innerHTML += that.makeTemplateString(selectTemplate, townItems)

            that._selectCity = this.value
            that.setGalleryUI(that._selectCity)
        })

        eleSelectTown.addEventListener('change',function() {
            that._selectTown =  this.value 

            that.setGalleryUI(that._selectCity,that._selectTown)
        })
    }

    setGalleryUI(city = 'all',town = 'all') {
        const eleGallery = document.querySelector('#Gallery')

        // clear gallery datas
        eleGallery.innerHTML = ''
        
        let innerHtml  = ""

        if(city === 'all') {
            Object.keys(this.datas).forEach(cityItem=>{
                Object.keys(this.datas[cityItem]).forEach(townItem=>{
                    innerHtml +=  this.makeTemplateString(galleryTemplate,this.datas[cityItem][townItem])
                })
            })
        } else if(town === 'all') {
            Object.keys(this.datas[city]).forEach(townItem=>{
                innerHtml +=  this.makeTemplateString(galleryTemplate,this.datas[city][townItem])
            })
        } else {
            innerHtml += this.makeTemplateString(galleryTemplate,this.datas[city][town])
        }


        eleGallery.innerHTML = innerHtml
    }

    makeTemplateString(templateFn,data) {
        let result = ""

        data.forEach(item=>{
            result += templateFn(item)
        })

        return result
    }
    // safety pattern
    static getInstance() {
        if(!this.instance) {
            this.instance = new Gallery()
        }

        return this.instance
    }

}


function galleryTemplate(item) {
    return `
        <li class="galleryItem">
            <img src="${item.PicURL}" alt="${item.Town}">
            <div class="galleryItem__tag">
                ${item.City}
            </div>
            <div class="galleryItem__detail">
                <h3>
                    ${item.Town}
                </h3>
                <h4>
                    ${item.Name}
                </h4>
                <div class="galleryItem__line"></div>
                <p>
                    ${item.HostWords}
                </p>
            </div>
        </li>
    `
}

function selectTemplate(item) {
    return `<option value="${item}">${item}</option>`
}

// main
(async function() {
    const gallery = Gallery.getInstance()

    gallery.init()
}())


