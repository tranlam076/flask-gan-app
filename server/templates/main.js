let host = window.location.href.substring(0, window.location.href.lastIndexOf('/'))
let api = host + '/';
let mode = "auto"
let num_of_style = 1;
let current_style = 1
let loaded_domain = {};
let current_domain = [];
let no_loaded = [];
let list_src=[];
let list_checkbox = ["#domain-beard", "#domain-blond-hair", "#domain-eyeglasses", "#domain-female",
                     "#domain-male", "#domain-old", "#domain-smiling"]
let list_title = ["Beard", "Blond Hair", "Eyeglasses", "Female", "Male", "Old", "Smiling"];
function request(url, method, data, callback) {
    $.ajax({
        url: url,
        crossDomain: true,
        data: (data !== null) ? JSON.stringify(data) : data,
        contentType: 'application/json; charset=utf-8',
        error: function(error) {
            callback(error);
        },
        success: function(data) {
            callback(null, data);
        },
        type: method
    });
}

let Upload = function (file) {
    this.file = file;
};

Upload.prototype.getType = function() {
    return this.file.type;
};
Upload.prototype.getSize = function() {
    return this.file.size;
};
Upload.prototype.getName = function() {
    return this.file.name;
};
Upload.prototype.doUpload = function (url, domain, mode, num_of_style) {
    let that = this;
    let formData = new FormData();
    $('.progress-container').show();

    // add assoc key values, this will be posts values
    formData.append("file_source", this.file, this.getName());

    if (mode == "refer") {
        let file = $('#file-upload-refer')[0].files[0];
        formData.append("file_refer", file, file.name);
    }
    formData.append('domain', domain);
    formData.append('mode', mode);
    formData.append('num_of_style', num_of_style);

    $.ajax({
        type: "POST",
        url: url,
        xhr: function () {
            let myXhr = $.ajaxSettings.xhr();
            if (myXhr.upload) {
                myXhr.upload.addEventListener('progress', that.progressHandling, false);
            }
            return myXhr;
        },
        success: function (data) {
            // your callback here
            $('.progress-container').hide();
            console.log(data.data);
            localStorage.setItem('job_id', data.data['job_id']);
            $('#overlay').show();
        },
        error: function (error) {
            // handle error
            $('.progress-container').hide();
        },
        async: true,
        data: formData,
        cache: false,
        contentType: false,
        processData: false,
    });
};

Upload.prototype.progressHandling = function (event) {
    let percent = 0;
    let position = event.loaded || event.position;
    let total = event.total;
    let progress_bar_id = "#progress-wrp";
    if (event.lengthComputable) {
        percent = Math.ceil(position / total * 100);
    }

    $(progress_bar_id + " .progress-bar").css("width", +percent + "%");
    $(progress_bar_id + " .status").text(percent + "%");
};

function createObjectURL(object) {
    return (window.URL) ? window.URL.createObjectURL(object) : window.webkitURL.createObjectURL(object);
}

function revokeObjectURL(url) {
    return (window.URL) ? window.URL.revokeObjectURL(url) : window.webkitURL.revokeObjectURL(url);
}

function addSourceFileAction() {
    let upload = document.getElementById('file-upload');
    function onFile() {
        let me = this,
        file = upload.files[0],
        name = file.name.split(".")[1]
        current_domain = []
        loaded_domain = {}
        name = name.toLowerCase()
        $(".area").css("opacity", "1")
        if (name != "png" && name != "jpg" && name != "jpeg") {
            alert("Invalid image format")
            return
        }
        var src = createObjectURL(file);
        var image = new Image();
        image.src = src;
        $('#img_prev')
            .attr('src', src)

    }

    upload.addEventListener('dragenter', function (e) {
        upload.parentNode.className = 'area dragging';
    }, false);

    upload.addEventListener('dragleave', function (e) {
        upload.parentNode.className = 'area';
    }, false);

    upload.addEventListener('dragdrop', function (e) {
        onFile();
    }, false);

    upload.addEventListener('change', function (e) {
        onFile();
    }, false);
}

function addReferFileAction() {
    let upload = document.getElementById('file-upload-refer');
    function onFile() {
        let me = this,
        file = upload.files[0],
        name = file.name.split(".")[1]
        current_domain = []
        loaded_domain = {}
        name = name.toLowerCase()
        $(".area").css("opacity", "1")
        if (name != "png" && name != "jpg" && name != "jpeg") {
            alert("Invalid image format")
            return
        }
        var src = createObjectURL(file);
        var image = new Image();
        image.src = src;
        $('#img_prev_refer')
            .attr('src', src)
    }

    upload.addEventListener('dragenter', function (e) {
        upload.parentNode.className = 'area dragging';
    }, false);

    upload.addEventListener('dragleave', function (e) {
        upload.parentNode.className = 'area';
    }, false);

    upload.addEventListener('dragdrop', function (e) {
        onFile();
    }, false);

    upload.addEventListener('change', function (e) {

        console.log("000000")
        onFile();
    }, false);
}


function gen_checkbox(is_check, label) {
    let checkbox_checked = `<input type="checkbox" checked="checked">${label}</label>`
    let checkbox_un_checked = `<input type="checkbox"><label>${label}</label>`
    if (is_check) {
        return checkbox_checked
    }
    return checkbox_un_checked
}

function check_domain_loaded(loaded, check) {
    let domains = []
    for (let i = 0; i < check.length; i++) {
//        if (!loaded.hasOwnProperty(check[i])) {
        if (true) {
            domains.push(check[i])
        }
    }
    return domains
}

function addBtnAction() {
    $('#btn-execute').on('click', function(){
        num_of_style = $("#num-of-style").val();
        if (num_of_style < 1) {
            num_of_style = 1
        }
        if (num_of_style > 10) {
            num_of_style = 10
        }
        $("#num-of-style").val(num_of_style)
        let file = $('#file-upload')[0].files[0];
        let file_refer = $('#file-upload-refer')[0].files[0];
        let is_male = $('#select-gender option:selected').val() == "0";
        let domain_id = [0, 1, 2, 3, 4, 5, 6]
        current_domain = []
        let req_domain = ""
        let check_index = [$('#domain-beard input').prop("checked")? 1: 0,
                           $('#domain-blond-hair input').prop("checked")? 1: 0,
                           $('#domain-eyeglasses input').prop("checked")? 1: 0,
                           $('#domain-female input').prop("checked")? 1: 0,
                           $('#domain-male input').prop("checked")? 1: 0,
                           $('#domain-old input').prop("checked")? 1: 0,
                           $('#domain-smiling input').prop("checked")? 1: 0]

        for (let i = 0; i < check_index.length; i++) {
            if (check_index[i] == 1) {
                req_domain += domain_id[i] + ","
                current_domain.push(i)
            }
        }

        req_domain = req_domain.substring(0, req_domain.length-1)
        if (req_domain == "") {
            req_domain = 0
            $(list_checkbox[0]).html(gen_checkbox(true, list_title[0]));
        }

        let mode = $("#select-mode option:selected").val()
        if (mode == "refer") {
            if (file_refer) {
                faceMark.drawImage([]);
                let upload = new Upload(file_refer);
            } else {
                alert('choose refer file first');
            }
        }

        if (file) {
            faceMark.drawImage([]);
            let upload = new Upload(file);
            upload.doUpload(api + 'upload', req_domain, mode, num_of_style);
        } else {
            alert('choose source file first');
        }
    });


    $('#domain-all input').unbind().on('change', function(){
        let is_check_all = $(this).prop("checked");
        if (is_check_all) {
            for (let i = 0; i < list_checkbox.length; i++) {
                $(list_checkbox[i]).html(gen_checkbox(true, list_title[i]))
            }
        } else {
            for (let i = 0; i < list_checkbox.length; i++) {
                $(list_checkbox[i]).html(gen_checkbox(false, list_title[i]))
            }
        }
    });


    $('#select-mode').on('change', function(){
        if ($("#select-mode option:selected").val() ==  "refer") {
            $(".style-info").hide()
            $(".refer-info").show()
            current_style = 1;
            for (let i = 0; i < list_checkbox.length; i++) {
                $(list_checkbox[i]).html(gen_checkbox(false, list_title[i]))
                $(list_checkbox[i]).unbind().on("click", function() {
                    for (let j = 0; j < list_checkbox.length; j++) {
                        $(list_checkbox[j]).html(gen_checkbox(false, list_title[j]))
                    }
                    $(this).html(gen_checkbox(true, list_title[i]))
                })
            }
        } else {
            $(".style-info").show()
            $(".refer-info").hide()
            for (let i = 0; i < list_checkbox.length; i++) {
                $(list_checkbox[i]).html(gen_checkbox(false, list_title[i]))
                $(list_checkbox[i]).unbind()
            }
            $("#domain-all").html(gen_checkbox(false, "All"))
            $('#domain-all input').unbind().on('change', function(){
                let is_check_all = $(this).prop("checked");
                if (is_check_all) {
                    for (let i = 0; i < list_checkbox.length; i++) {
                        $(list_checkbox[i]).html(gen_checkbox(true, list_title[i]))
                    }
                } else {
                    for (let i = 0; i < list_checkbox.length; i++) {
                        $(list_checkbox[i]).html(gen_checkbox(false, list_title[i]))
                    }
                }
            });
        }
        faceMark.drawImage(list_src);
        mode = $("#select-mode option:selected").val()
    });


    $("#btn-hide-label").on("click", function() {
        $("#btn-hide-label").hide();
        $("#btn-show-label").show();
        is_show_label = false;
        faceMark.drawImage(list_src);
    })
    $("#btn-show-label").on("click", function() {
        $("#btn-hide-label").show();
        $("#btn-show-label").hide();
        is_show_label = true;
        faceMark.drawImage(list_src);
    })
}

function image_fixing(id) {
    natural_height = $(id).prop("naturalHeight")
    natural_width = $(id).prop("naturalWidth")
    scale = natural_width/natural_height
    $(id).css('margin-top', -96.666 + "%");
    if (scale > 1) {
        $(id).css('width', 90 + "%");
        let height = parseInt($(id).prop("offsetWidth"))/scale
        let old_margin_top = parseInt($(id).css('margin-top'));
        $(id).css('margin-top', (old_margin_top + height*0.45) + "px");
        $(id).css('height', height + 'px');

    } else {
        $(id).css('height', 90 + "%");
        let width = parseInt($(id).prop("offsetHeight"))*scale
        $(id).css('width', width + 'px');
    }
}

//-----------------------------------socket-handler---------------------------------
const socket = io(host);
$(window).resize(function(){
//    let list_src = localStorage.getItem("list_src")
//    list_src = list_src.split(",")
    if (list_src.length == 0) {
        return
    }
    faceMark.drawImage([])
    if (list_src) {
        faceMark.drawImage(list_src);
    }
});

$(document).ready(function(){
    faceMark.drawImage([]);
//    localStorage.setItem("list_src", "")
    socket.on('notify', function (responseData) {
        $('#overlay').hide();
        let content = JSON.parse(responseData);
        let data = JSON.parse(content['data']);
        let job = localStorage.getItem('job_id');
        if (job ===   data["job_id"]) {
            console.log(data)
            list_src = data["data"];
            faceMark.drawImage(list_src);
        }
        console.log(data)
    });
    addSourceFileAction();
    addReferFileAction();
    addBtnAction();
    let image_resizing = setInterval(function () {
        image_fixing("#img_prev")
        image_fixing("#img_prev_refer")
    }, 500)

    document.getElementById('style-progress-bar').addEventListener('click', function(e) {
        var x = e.pageX - this.offsetLeft;
        var x_convert = x / document.getElementById('style-progress-bar').offsetWidth;
        document.getElementById('style-progress-bar').value = x_convert;
        current_style = parseInt(x_convert/(1/num_of_style)) + 1
        document.getElementById('style-progress-bar').value = current_style/num_of_style
        faceMark.drawImage(list_src)
    });
  });


