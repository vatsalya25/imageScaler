console.log("Script loaded");
let plotJson, fileName, pos_x, pos_y;

const oReq = new XMLHttpRequest();
oReq.onload = reqListener;
oReq.open("get", "./inputs/plot_id.json", true);
oReq.send();

function reqListener(e) {
  plotJson = JSON.parse(this.responseText);
  plotJson.forEach(function(plot) {
    const option = document.createElement("option");
    option.value = plot.id;
    option.textContent = plot.id;
    document.getElementById('plot_select').appendChild(option);
  });
}

function previewFile(){
  const preview = document.getElementById('uploaded_image'); //selects the query named img
  const file    = document.querySelector('input[type=file]').files[0]; //same as here
  const reader  = new FileReader();

  reader.onloadend = function () {
    preview.src = reader.result;
  }

  if (file) {
    reader.readAsDataURL(file); //reads the data as a URL
    document.getElementsByClassName('uploaded')[0].classList.remove('hidden');
    fileName = file.name;
    loadPlots();
  }
}

function loadPlots() {
  let plotArr = JSON.parse(localStorage.getItem(fileName));
  let parentDiv = document.getElementById('saved_plots');

  plotArr = sortByKey(plotArr, 'plotId');

  if(plotArr !== null) {
    document.getElementById('download_file').classList.remove('hidden');
    document.getElementById('saved_plots').classList.remove('hidden');
    plotArr.forEach(function(plot) {
      let plotDiv = document.getElementById(plot.plotId);
      if(plotDiv) plotDiv.remove();
    })
  }

  if(plotArr !== null) {
    plotArr.forEach(function(plot) {
      const plotDiv = '<div id="'+plot.plotId+'" class="plot_value" onclick="showMarker('+plot.xValue+','+plot.yValue+')"><div class="plot_title">'+plot.plotId+'</div><div class="plot_xValue">'+plot.xValue+'</div><div class="plot_yValue">'+plot.yValue+'</div><div class="delete_plot" onclick="deletePlot(\''+plot.plotId+'\', event)"></div></div>';
      // document.getElementById('saved_plots').append(plotDiv);
      parentDiv.innerHTML = parentDiv.innerHTML + plotDiv;
    });
  }
};

function sortByKey(array, key) {
  return array.sort(function(a, b) {
    var x = a[key]; var y = b[key];
    var xCategory = x.charAt(0), xNumber = x.substring(1, x.length);
    var yCategory = y.charAt(0), yNumber = y.substring(1, y.length);
    if(xCategory < yCategory) {
      return -1;
    } else if (xCategory > yCategory) {
      return 1;
    } else {
      return ((xNumber < yNumber) ? -1 : ((xNumber > yNumber) ? 1 : 0));
    }
  });
}

function calculateCoord (e) {
  pos_x = event.offsetX ? (event.offsetX) : event.pageX - document.getElementById('pointer_div').offsetLeft;
  pos_y = event.offsetY ? (event.offsetY) : event.pageY - document.getElementById('pointer_div').offsetTop;
  let selectedPlot = document.getElementById('plot_select').value;
  let plotArr = JSON.parse(localStorage.getItem(fileName));

  if(!isEmpty(plotArr)) {
    plotArr.forEach(function(plot) {
      if(selectedPlot === plot.plotId) {
        document.getElementById('modal_warning').classList.remove('hidden');
        document.getElementById('prev_marker').classList.remove('hidden');
        document.getElementById('modal_save_btn').innerHTML = 'Overwrite';
        document.getElementById('prev_marker').style.left = plot.xValue + 'px';
        document.getElementById('prev_marker').style.top = plot.yValue + 'px';
      }
    });
  }

  document.getElementById('xValue').innerHTML = pos_x;
  document.getElementById('yValue').innerHTML = pos_y;
  document.getElementsByClassName('modal_bg')[0].classList.remove('hidden');
  enableDragging();

  document.getElementById('curr_marker').style.left = pos_x + 'px';
  document.getElementById('curr_marker').style.top = pos_y + 'px';
  document.getElementById('curr_marker').classList.remove('hidden');
}

function closeModal() {
  document.getElementsByClassName('modal_bg')[0].classList.add('hidden');
  document.getElementsByClassName('modal_bg')[1].classList.add('hidden');
  document.getElementById('prev_marker').classList.add('hidden');
  document.getElementById('curr_marker').classList.add('hidden');
}

function selectionChange() {
  let selectedPlot = document.getElementById('plot_select').value;
  let plotArr = JSON.parse(localStorage.getItem(fileName));
  let plotCheck = false;
  const plotObj = {
    plotId: selectedPlot,
    xValue: pos_x,
    yValue: pos_y
  }

  if(!isEmpty(plotArr)) {
    plotArr.forEach(function(plot) {
      if(selectedPlot === plot.plotId) {
        document.getElementById('modal_warning').classList.remove('hidden');
        document.getElementById('modal_save_btn').innerHTML = 'Overwrite';
        document.getElementById('prev_marker').classList.remove('hidden');
        document.getElementById('prev_marker').style.left = plot.xValue + 'px';
        document.getElementById('prev_marker').style.top = plot.yValue + 'px';
        plotCheck = true;
      }
    });

    if(!plotCheck) {
      document.getElementById('modal_warning').classList.add('hidden');
      document.getElementById('modal_save_btn').innerHTML = 'Save';
      document.getElementById('prev_marker').classList.add('hidden');
    }
  }
}

function saveCoord() {
  let selectedPlot = document.getElementById('plot_select').value;
  let plotArr = [];
  let plotCheck = false;
  const plotObj = {
    plotId: selectedPlot,
    xValue: pos_x,
    yValue: pos_y
  }

  if (localStorage.getItem(fileName) !== null) {
    plotArr = JSON.parse(localStorage.getItem(fileName));
    plotArr.forEach(function(plot) {
      if(plotObj.plotId === plot.plotId) {
        plot.xValue = pos_x;
        plot.yValue = pos_y;
        plotCheck = true;
      }
    });
    if(!plotCheck) {
      plotArr.push(plotObj);
    }
  } else {
    plotArr.push(plotObj);
  }

  localStorage.setItem(fileName, JSON.stringify(plotArr));
  closeModal();
  loadPlots();
}

function showMarker(xValue, yValue) {
  document.getElementById('curr_marker').classList.add('hidden');
  document.getElementById('curr_marker').style.left = xValue + 'px';
  document.getElementById('curr_marker').style.top = yValue + 'px';
  document.getElementById('curr_marker').classList.remove('hidden');
}

function deletePlot(plotId, event) {
  event.preventDefault();
  let index = 0;
  const plotArr = JSON.parse(localStorage.getItem(fileName));

  plotArr.forEach(function(plot, i) {
    if(plot.plotId === plotId) {
      index = i;
    }
  });
  plotArr.splice(index, 1);
  localStorage.setItem(fileName, JSON.stringify(plotArr));
  document.getElementById(plotId).remove();
}

function downloadFile() {
  const plotArr = JSON.parse(localStorage.getItem(fileName));

  if(!isEmpty(plotArr)) {
    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(plotArr));
    var dlAnchorElem = document.getElementById('download_file');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", "Plot_Coordinates.json");
  } else {
    document.getElementsByClassName('modal_bg')[1].classList.remove('hidden');
  }
}

function isEmpty(obj) {
  for(var key in obj) {
    if(obj.hasOwnProperty(key)) return false;
  }
  return true;
}

function enableDragging() {
  var selected = null, // Object of the element to be moved
    x_pos = 0, y_pos = 0, // Stores x & y coordinates of the mouse pointer
    x_elem = 0, y_elem = 0; // Stores top, left values (edge) of the element

  // Will be called when user starts dragging an element
  function _drag_init(elem) {
    // Store the object of the element which needs to be moved
    selected = elem;
    x_elem = x_pos - selected.offsetLeft;
    y_elem = y_pos - selected.offsetTop;
  }

  // Will be called when user dragging an element
  function _move_elem(e) {
    x_pos = document.all ? window.event.clientX : e.pageX;
    y_pos = document.all ? window.event.clientY : e.pageY;
    if (selected !== null) {
        selected.style.left = (x_pos - x_elem) + 'px';
        selected.style.top = (y_pos - y_elem) + 'px';
    }
  }

  // Destroy the object when we are done
  function _destroy() {
    selected = null;
  }

  // Bind the functions...
  document.getElementById('modal_drag').onmousedown = function () {
    console.log('1', document.getElementById('modal_save'));
    console.log('2', this);
    _drag_init(document.getElementById('modal_save'));
    return false;
  };

  document.onmousemove = _move_elem;
  document.onmouseup = _destroy;
};
