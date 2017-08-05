$(document).ready(function () {
  var allBookmarks = {}
  window.searchItemCount = 0
  var m = $('#msg')
  var s = $('#txtSearch')
  var l = $('#list')
  m.text('loading...')
  chrome.bookmarks.getTree(function (bookmarkResults) {
    allBookmarks = bookmarkResults[0] //.children[0]
    searchItemCount = 0
    SearchBookmarks(allBookmarks, l)
    m.text(searchItemCount + ' bookmarks')
    $('#list a.nli span.sp').click(navigate)
  })
  s.keyup(function (e) {
    if (e.keyCode == 13) {
      m.text('searching...')
      l.html('')
      var olTag = $('<ol></ol>')
      l.append(olTag)
      searchItemCount = 0
      SearchBookmarks(allBookmarks, olTag, s.val().toLowerCase().trim())
      m.text(searchItemCount + ' matches found')
      $('#list a.nli span.sp').click(navigate)
    }
  })

  var modes = {
    "currentTab": 'current',
    "backgroundTab": "background",
    "newTab": "new"
  }

  function navigate(e) {
    e.preventDefault()
    var url = $(this).parent('a').attr('href')
    var mode = $(this).attr('data-mode')

    if(url == 'undefined'){
      return false
    }

    switch (mode) {
      case modes.backgroundTab:
        chrome.tabs.create({
          "url": url,
          "active": false
        })
        break
      case modes.currentTab:
        chrome.tabs.update({
          url: url
        });
        break
      case modes.newTab:
        chrome.tabs.create({
          "url": url,
          "active": true
        })
        break
      default:
        break
    }

  }
})



function SearchBookmarks(parentNode, domElementToAppendTo, searchText) {
  var curList = $('<ol></ol>')
  try {
    for (var j = 0; j < parentNode.children.length; j++) {
      var curNode = parentNode.children[j]
      var childDom = $('<li><a class="nli" href="' + curNode.url + '">[' +
        '<span class="sp" data-mode="current">C</span>' +
        '<span class="sp" data-mode="background">B</span>' +
        '<span class="sp" data-mode="new">N</span>]' +
        curNode.title + '</a></li>')
      if (searchText && searchText.length > 0) {
        if (curNode.title && curNode.title.toLowerCase().indexOf(searchText) != -1) {
          searchItemCount++
          domElementToAppendTo.append(childDom)
        }
        if (curNode.children && curNode.children.length > 0) {
          SearchBookmarks(curNode, domElementToAppendTo, searchText)
        }
      } else {
        searchItemCount++
        curList.append(childDom)
        if (curNode.children && curNode.children.length > 0) {
          SearchBookmarks(curNode, childDom, searchText)
        }
      }
    }
    domElementToAppendTo.append(curList)
  } catch (err) {
    alert(err)
  }
}
