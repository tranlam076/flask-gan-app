let host = window.location.href.substring(0, window.location.href.lastIndexOf('/'))
let api = host + '/';
let loaded_domain = {}
let current_domain = []
let no_loaded = []
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
Upload.prototype.doUpload = function (url, domain, is_merge) {
    let that = this;
    let formData = new FormData();
    $('.progress-container').show();

    // add assoc key values, this will be posts values
    formData.append("file", this.file, this.getName());
    formData.append('domain', domain);
    formData.append('is_merge', is_merge);

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
//            faceMark.drawImage(api + 'files/output/' + data.data['src']);
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

function addFileAction() {
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
        console.log( $('#img_prev').css("width"))
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
        let file = $('#file-upload')[0].files[0];
        let female_domain = [0, 1, 2, 3];
        let male_beard_domain = [4, 5, 6, 7];
        let male_no_beard_domain = [8, 9, 10, 11];
        let is_male = $('#select-gender option:selected').val() == "0";
        let is_beard = $('#select-beard option:selected').val() == "0";
        let domain_id = []
        current_domain = []
        if (is_male) {
            if (is_beard) {
                domain_id = male_beard_domain;
            } else {
                domain_id = male_no_beard_domain;
            }
        } else {
            domain_id = female_domain;
        }
        let req_domain = ""
        let check_index = [$('#blond-hair-domain input').prop("checked")? 1: 0, $('#old-domain input').prop("checked")? 1: 0,
                            $('#smiling-domain input').prop("checked")? 1: 0,
                            $('#young-domain input').prop("checked")? 1: 0,]
        for (let i = 0; i < check_index.length; i++) {
            if (check_index[i] == 1) {
                req_domain += domain_id[i] + ","
                current_domain.push(domain_id[i])
            }
        }

        req_domain = req_domain.substring(0, req_domain.length-1)
        if (req_domain == "") {
            req_domain = 7
            current_domain.push(7)
            $('#young-domain').html(gen_checkbox(true, "Young"));
        }
        no_loaded = check_domain_loaded(loaded_domain, current_domain)
        req_domain = ""
        if (no_loaded.length > 0) {
            for (let i = 0; i < no_loaded.length; i++) {
                req_domain += no_loaded[i] + ","
            }
        }
        req_domain = req_domain.substring(0, req_domain.length-1)
        let is_merge_domain = $("#merge-domain").prop("checked")
        if (file) {
            faceMark.drawImage([]);
            let upload = new Upload(file);
            if (req_domain != "") {
                $('#overlay').show();
                upload.doUpload(api + 'upload', req_domain, is_merge_domain);
            } else {
                let to_load = []
                for (let i = 0; i < current_domain.length; i++) {
                    to_load.push(loaded_domain[current_domain[i]])
                }
                faceMark.drawImage(to_load)
                localStorage.setItem("list_src", to_load)
            }
        } else {
            alert('choose file first');
        }
    });

    $('#merge-domain').on('change', function(){
        let is_merge_domain = $('#merge-domain').prop("checked");
        let is_young = $('#young-domain input').prop("checked");
        let is_old = $('#old-domain input').prop("checked");
        if (is_merge_domain) {
            if (is_young && is_old) {
                $('#young-domain').html(gen_checkbox(true, "Young"));
                $('#old-domain').html(gen_checkbox(false, "Old"));
            }
        }
    });

    $('#young-domain').on('change', function(){
        let is_merge_domain = $('#merge-domain').prop("checked");
        let is_young = $('#young-domain input').prop("checked");
        let is_old = $('#old-domain input').prop("checked");
        if (is_merge_domain) {
            if (is_young && is_old) {
                $('#young-domain').html(gen_checkbox(true, "Young"));
                $('#old-domain').html(gen_checkbox(false, "Old"));
            }
        }
    });

    $('#old-domain').on('change', function(){
        let is_merge_domain = $('#merge-domain').prop("checked");
        let is_young = $('#young-domain input').prop("checked");
        let is_old = $('#old-domain input').prop("checked");
        if (is_merge_domain) {
            if (is_young && is_old) {
                $('#young-domain').html(gen_checkbox(false, "Young"));
                $('#old-domain').html(gen_checkbox(true, "Old"));
            }
        }
    });

    $('#select-gender').on('change', function(){
        if ($("#select-gender option:selected").val() ==  "1") {
            $("#select-beard").hide()
        } else {
            $("#select-beard").show()
        }
    });
}

//-----------------------------------socket-handler---------------------------------
const socket = io(host);
$(window).resize(function(){
    let list_src = localStorage.getItem("list_src")
    list_src = list_src.split(",")
    if (list_src[0] == "") {
        return
    }
    faceMark.drawImage([])
    if (list_src) {
        faceMark.drawImage(list_src);
    }
});

$(document).ready(function(){
    faceMark.drawImage([]);
    localStorage.setItem("list_src", "")
    socket.on('notify', function (responseData) {
        $('#overlay').hide();
        let content = JSON.parse(responseData);
        let data = JSON.parse(content['data']);
        let job = localStorage.getItem('job_id');
        if (job ===   data["job_id"]) {
            let to_load = []
            for (let i = 0; i < data["data"].length; i++) {
                loaded_domain['' + no_loaded[i]] = data["data"][i]
            }
            for (let i = 0; i < current_domain.length; i++) {
                to_load.push(loaded_domain[current_domain[i]])
            }
            console.log(loaded_domain)
            console.log(current_domain)
            console.log(to_load)
            faceMark.drawImage(to_load);
            localStorage.setItem("list_src", to_load)
        }
        console.log(data)
    });
    addFileAction();
    addBtnAction();
  });


