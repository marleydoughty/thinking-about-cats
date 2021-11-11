var $images = document.querySelector('.images');

function getData(image) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', 'https://api.thecatapi.com/v1/images/search?limit=100&page=0');
  xhr.responseType = 'json';
  xhr.addEventListener('load', function () {
    for (var i = 0; i < 9; i++) {
      var imageContainer = document.createElement('div');
      imageContainer.className = 'row image-container';
      $images.appendChild(imageContainer);

      // var columnFull = document.createElement('div');
      // columnFull.className = 'column-full';
      // imageContainer.appendChild(columnFull);

      var image = document.createElement('img');
      image.setAttribute('src', xhr.response[i].url);
      image.className = 'column-full';
      imageContainer.appendChild(image);

      var commentSection = document.createElement('div');
      commentSection.className = 'row comment-section';
      imageContainer.appendChild(commentSection);

      var columnHalf = document.createElement('div');
      columnHalf.className = 'comment-form column-half';
      commentSection.appendChild(columnHalf);

      var commentOutput = document.createElement('p');
      columnHalf.appendChild(commentOutput);

      var form = document.createElement('form');
      columnHalf.appendChild(form);

      var commentInput = document.createElement('input');
      commentInput.setAttribute('type', 'text');
      commentInput.setAttribute('placeholder', 'Add comments here');
      commentInput.className = 'comment-box';
      form.appendChild(commentInput);

      var saveComment = document.createElement('input');
      saveComment.setAttribute('type', 'submit');
      saveComment.setAttribute('value', 'Save');
      saveComment.className = 'save-button';
      form.appendChild(saveComment);

      var commentIconContainer = document.createElement('div');
      commentIconContainer.className = 'comment-icon column-half';
      commentSection.appendChild(commentIconContainer);

      var commentIcon = document.createElement('i');
      commentIcon.className = 'far fa-comment';
      commentIconContainer.appendChild(commentIcon);
    }
  });
  xhr.send();
}

getData();

var $allImages = document.querySelector('.images');

function clickedCommentIcon(event) {
  // console.log('it clicked:', event);
  // console.log('event.target:', event.target);
  // console.log('event.target.tagName:', event.target.tagName);
  if (event.target && event.target.tagName === 'FAR') {
    // var commentForm = event.target.closest('.comment-form');

    // commentForm.className = 'comment-form';
  }
  // console.log('closest comment-form:', commentForm);
}

$allImages.addEventListener('click', clickedCommentIcon);
