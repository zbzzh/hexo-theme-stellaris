// A local search script with the help of
// [hexo-generator-search](https://github.com/PaicHyperionDev/hexo-generator-search)
// Copyright (C) 2015
// Joseph Pan <http://github.com/wzpan>
// Shuhao Mao <http://github.com/maoshuhao>
// This library is free software; you can redistribute it and/or modify
// it under the terms of the GNU Lesser General Public License as
// published by the Free Software Foundation; either version 2.1 of the
// License, or (at your option) any later version.
//
// This library is distributed in the hope that it will be useful, but
// WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
// Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public
// License along with this library; if not, write to the Free Software
// Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA
// 02110-1301 USA
//
// Modified by:
// Pieter Robberechts <http://github.com/probberechts>

/*exported searchFunc*/
var searchFunc = function (path, filter, searchId, contentId) {
  function getAllCombinations(keywords) {
    var i,
      j,
      result = []

    for (i = 0; i < keywords.length; i++) {
      for (j = i + 1; j < keywords.length + 1; j++) {
        result.push(keywords.slice(i, j).join(' '))
      }
    }
    return result
  }

  $.ajax({
    url: path,
    dataType: 'json',
    success: function (jsonResponse) {
      var datas = jsonResponse
      var $input = document.getElementById(searchId)
      if (!$input) {
        return
      }
      var $resultContent = document.getElementById(contentId)

      $input.addEventListener('input', function () {
        var resultList = []
        var keywords = getAllCombinations(
          this.value.trim().toLowerCase().split(' ')
        ).sort(function (a, b) {
          return b.split(' ').length - a.split(' ').length
        })
        $resultContent.innerHTML = ''
        if (this.value.trim().length <= 0) {
          return
        }
        // perform local searching
        datas.forEach(function (data) {
          if (data.title) {
            if (!data.title.trim().length) {
              return
            }
          }
          if (data.content) {
            if (!data.content.trim().length) {
              return
            }
          }
          var matches = 0
          if (filter && !data.path.includes(filter)) {
            return
          }
          var dataTitle = data.title ? data.title.trim() : ''
          var dataTitleLowerCase = dataTitle.toLowerCase()
          var dataContent = data.content
          var dataContentLowerCase = dataContent.toLowerCase()
          var dataUrl = data.path
          var indexTitle = -1
          var indexContent = -1
          var firstOccur = -1
          // only match artiles with not empty contents
          if (dataContent !== '') {
            keywords.forEach(function (keyword) {
              indexTitle = dataTitleLowerCase.indexOf(keyword)
              indexContent = dataContentLowerCase.indexOf(keyword)

              if (indexTitle >= 0 || indexContent >= 0) {
                matches += 1
                if (indexContent < 0) {
                  indexContent = 0
                }
                if (firstOccur < 0) {
                  firstOccur = indexContent
                }
              }
            })
          }
          // show search results
          if (matches > 0) {
            var searchResult = {}
            searchResult.rank = matches
            searchResult.str =
              "<li><a href='" +
              dataUrl +
              "'><span class='search-result-title'>" +
              dataTitle +
              '</span>'
            if (firstOccur >= 0) {
              // cut out 100 characters
              var start = firstOccur - 20
              var end = firstOccur + 80

              if (start < 0) {
                start = 0
              }

              if (start == 0) {
                end = 100
              }

              if (end > dataContent.length) {
                end = dataContent.length
              }

              var matchContent = dataContent.substring(start, end)

              // highlight all keywords
              var regS = new RegExp(keywords.join('|'), 'gi')
              matchContent = matchContent.replace(regS, function (keyword) {
                return '<span class="search-keyword">' + keyword + '</span>'
              })

              searchResult.str +=
                '<p class="search-result-content">' + matchContent + '...</p>'
            }
            searchResult.str += '</a></li>'
            resultList.push(searchResult)
          }
        })
        if (resultList.length) {
          resultList.sort(function (a, b) {
            return b.rank - a.rank
          })
          var result = '<ul class="search-result-list">'
          for (var i = 0; i < resultList.length; i++) {
            result += resultList[i].str
          }
          result += '</ul>'
          $resultContent.innerHTML = result
        }
      })
    },
  })
}
