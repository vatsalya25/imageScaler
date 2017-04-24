console.log("Script loaded");
let plotJson, fileName, pos_x, pos_y, selectedPlot;

const oReq = new XMLHttpRequest();
oReq.onload = reqListener;
oReq.open("get", "./../inputs/plot_id.json", true);
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
    plotArr.forEach(function(plot) {
      let plotDiv = document.getElementById(plot.plotId);
      if(plotDiv) plotDiv.remove();
    })
  }

  if(plotArr !== null) {
    plotArr.forEach(function(plot) {
      const plotDiv = '<div id="'+plot.plotId+'" class="plot_value"><div class="plot_title">'+plot.plotId+'</div><div class="plot_xValue">'+plot.xValue+'</div><div class="plot_yValue">'+plot.yValue+'</div><div class="delete_plot" onclick="deletePlot(\''+plot.plotId+'\')"></div></div>';
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
  pos_x = event.offsetX ? (event.offsetX) : event.pageX - document.getElementById("pointer_div").offsetLeft;
  pos_y = event.offsetY ? (event.offsetY) : event.pageY - document.getElementById("pointer_div").offsetTop;

  document.getElementById('xValue').innerHTML = pos_x;
  document.getElementById('yValue').innerHTML = pos_y;
  document.getElementsByClassName('modal_bg')[0].classList.remove('hidden');
}

function closeModal() {
  document.getElementsByClassName('modal_bg')[0].classList.add('hidden');
  document.getElementsByClassName('modal_bg')[1].classList.add('hidden');
}


function saveCoord() {
  selectedPlot = document.getElementById('plot_select').value;
  let plotCoord = [];
  let plotCheck = false;
  const plotObj = {
    plotId: selectedPlot,
    xValue: pos_x,
    yValue: pos_y
  }

  if (localStorage.getItem(fileName) !== null) {
    plotCoord = JSON.parse(localStorage.getItem(fileName));
    plotCoord.forEach(function(plot) {
      if(plotObj.plotId === plot.plotId) {
        if(confirm("The coordinates for plot "+plot.plotId+" are already saved. \nAre you sure you want to overwrite it?")) {
          plot.xValue = pos_x;
          plot.yValue = pos_y;
        }
        plotCheck = true;
      }
    });
    if(!plotCheck) {
      plotCoord.push(plotObj);
    }
  } else {
    plotCoord.push(plotObj);
  }

  localStorage.setItem(fileName, JSON.stringify(plotCoord));
  document.getElementsByClassName('modal_bg')[0].classList.add('hidden');
  loadPlots();
}

function deletePlot(plotId) {
  let index = 0;
  const plotCoord = JSON.parse(localStorage.getItem(fileName));

  plotCoord.forEach(function(plot, i) {
    if(plot.plotId === plotId) {
      index = i;
    }
  });
  plotCoord.splice(index, 1);
  localStorage.setItem(fileName, JSON.stringify(plotCoord));
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
