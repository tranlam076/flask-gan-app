let currentImage = {
    x: 0,
    y: 0,
    width: 0,
    height: 0
};
function FaceMark () {
}


let domainMapping = {
    'Blond Hair': [0, 4, 8],
    'Old': [1, 5, 9],
    'Smiling': [2, 6, 10],
    'Young': [3, 7, 11]
}

function get_domain_by_id(id) {
    for (let key in domainMapping) {
        if (domainMapping[key].includes(id)) {
            return key
        }
    }
    return ""
}

FaceMark.prototype.drawImage = function (list_src) {

    let canvas = document.getElementById('canvas-large-image');
    canvas.height = document.getElementById('canvas-large-image').offsetHeight;
    canvas.width = document.getElementById('canvas-large-image').offsetWidth;
    let ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!list_src || list_src.length == 0) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
    }
    let canvas_split_width = parseInt((canvas.width - 5*(list_src.length + 1)) / list_src.length)
    for (let i = 0; i < list_src.length; i++) {
        let domain_name = get_domain_by_id(current_domain[i])
        console.log(domain_name)
        src = api + 'files/' +  list_src[i]
        let x,y,width,height;
        let img = new Image();
        img.onload = function () {
            let scaleImg = img.width/img.height;
            let scaleCanvas = canvas_split_width/canvas.height;
            if (scaleImg > scaleCanvas) {
                x = canvas_split_width*i + 5*(i + 1);
                width = canvas_split_width;
                height = canvas_split_width/scaleImg;
                y =  (canvas.height - 60 - height)/2
            } else {
                y = 5;
                height = canvas.height - 60;
                width = height*scaleImg;
                x = 5*(i + 1) + (canvas_split_width - width)/2 + canvas_split_width*i
            }

            ctx.drawImage(img, x, y, width, height);
            ctx.font = "20px Georgia"
            ctx.fillStyle = "red";
            ctx.textAlign = "center";
            ctx.fillText(domain_name, parseInt(x + width/2 - domain_name.length/2*2), y + height + 30);
        };
        img.src = src;
    }
};

let faceMark = new FaceMark();