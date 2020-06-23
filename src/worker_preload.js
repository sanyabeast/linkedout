console.log("WORKER IN WORK")
const ipc = window.ipc = require('electron').ipcRenderer;
const _ = require( "lodash" );
const { forEach } = require('lodash');
const { TweenMax } = require( "gsap" )
window._ = _

let constants = {
  task_debounce_timeout: 250,
  task_repeat_delay: 500,
  task_repeat_random_delay: 500,
  default_scroll_duration: 1,
  requested_scroll_timescale: 0.75,
  test_task_count: 10,
  delay_multiplier: 1
}

let repeat_canceled = false

let state = window.state = {
  url: window.location.href,
  invitations: {

  }
}

let tasks = {
  open_url: {
    callback: function( data ) {
      console.log(`opening url ${ data.url }`)
      window.open( data.url, "_self" )
      send_task_state(data.task_id, true, 1)
    }
  },
  test_task: {
    callback: _.debounce(function( data ){
      console.log(`test task ( count to ${constants.test_task_count} )`)
      repeat( {
        callback: ( i )=>{
          console.log(i)
          send_task_state(data.task_id, false, i / constants.test_task_count)
        },
        on_complete: ()=>{
          send_message({
            type: "task_complete",
            task_id: data.task_id
          })

          send_task_state(data.task_id, true, 1)
        },
        count: constants.test_task_count,
        delay: constants.task_repeat_delay,
        rand_delay: constants.task_repeat_random_delay
      } )
    }, constants.task_debounce_timeout)
  },
  accept_all_invitations: {
    callback: _.debounce(function( data ){
      console.log(`accepting all invitations (${ state.invitations.length })`)
      let invitations = state.invitations.slice()
      repeat( {
        callback: ( i )=>{
          let action_button = invitations[ i ].action_button
          fire_event( action_button, "click" )
          send_task_state(data.task_id, false, i / invitations.length)
        },
        on_complete: ()=>{
          send_message({
            type: "task_complete",
            task_id: data.task_id
          })

          send_task_state(data.task_id, true, 1)
        },
        count: invitations.length,
        delay: constants.task_repeat_delay,
        rand_delay: constants.task_repeat_random_delay
      } )
    }, constants.task_debounce_timeout)
  },
  setup_all_contacts: {
    callback: _.debounce(function( data ){
      console.log(`setting up all contacts (${ state.newcomers.length })`)
      let newcomers = state.newcomers.slice()
      repeat( {
        callback: ( i )=>{
          let action_button = newcomers[ i ].action_button
          fire_event( action_button, "click" )
          let confirm_btn = document.querySelector( ".artdeco-modal.send-invite button + button" )
          if ( confirm_btn ) {
            fire_event( confirm_btn, "click" )
          }

          send_task_state(data.task_id, false, i/newcomers.length)
        },
        on_complete: ()=>{
          send_message({
            type: "task_complete",
            task_id: data.task_id
          })

          send_task_state(data.task_id, true, 1)
        },
        count: newcomers.length,
        delay: constants.task_repeat_delay,
        rand_delay: constants.task_repeat_random_delay
      } )
    }, constants.task_debounce_timeout)
  },
  upvote_all_skillz: {
    callback: _.debounce(function( data ){
      console.log(`upvoting all skillz (${ state.skillz.length })`)
      let skillz = state.skillz.slice()
      repeat( {
        callback: ( i )=>{
          let action_button = skillz[ i ].action_button
          fire_event( action_button, "click" )
          send_task_state(data.task_id, false, i/skillz.length)
        },
        on_complete: ()=>{
          send_message({
            type: "task_complete",
            task_id: data.task_id
          })
          send_task_state(data.task_id, true, 1)
        },
        count: skillz.length,
        delay: constants.task_repeat_delay,
        rand_delay: constants.task_repeat_random_delay
      } )
    }, constants.task_debounce_timeout)
  },
  like_all_comments: {
    callback: _.debounce(function( data ){
      console.log(`upvoting all skillz (${ state.comments.length })`)
      let comments = state.comments.slice()
      repeat( {
        callback: ( i )=>{
          let action_button = comments[ i ].action_button
          fire_event( action_button, "click" )
          send_task_state(data.task_id, false, i/comments.length)
        },
        on_complete: ()=>{
          send_message({
            type: "task_complete",
            task_id: data.task_id
          })
          send_task_state(data.task_id, true, 1)
        },
        count: comments.length,
        delay: constants.task_repeat_delay,
        rand_delay: constants.task_repeat_random_delay
      } )
    }, constants.task_debounce_timeout)
  },
  like_all_posts: {
    callback: _.debounce(function( data ){
      console.log(`liking all posts (${ state.posts.length })`)
      let posts = state.posts.slice()
      repeat( {
        callback: ( i )=>{
          let action_button = posts[ i ].action_button
          fire_event( action_button, "click" )
          send_task_state(data.task_id, false, i/posts.length)
        },
        on_complete: ()=>{
          send_message({
            type: "task_complete",
            task_id: data.task_id
          })
          send_task_state(data.task_id, true, 1)
        },
        count: posts.length,
        delay: constants.task_repeat_delay,
        rand_delay: constants.task_repeat_random_delay
      } )
    }, constants.task_debounce_timeout)
  },
  quick_scroll: {
    callback: _.debounce(function( data ){
      quick_scroll( constants.requested_scroll_timescale, ()=>{
        send_task_state(data.task_id, true, 1)
      })
      
    }, constants.task_debounce_timeout)
  },
  next_page: {
    callback: _.debounce(function( data ){
      let button = document.querySelector(".artdeco-pagination [aria-label=Далее]")
      if ( button ) {
        fire_event( button, "click" )
      }

      send_task_state(data.task_id, true, 1)

    }, constants.task_debounce_timeout)
  }
}

ipc.on('message', (event, message) => {
    switch ( message.type ) {
      case "task":
        try {
          run_task( message )
        } catch ( err ) {
          console.warn( err )
          send_task_state( message.task_id, true, 1 )
        }
      break;
      case "cancel_task":
        repeat_canceled = true
      break;
      case "delay_multiplier":
        console.log(`setting delay multiplier to ${ message.value }`)
        constants.delay_multiplier = Number(message.value)
      break;
    }
})




window.send_message = function( data ) {
  ipc.send( "message", {
    to: "main",
    data
  } )
}



function fire_event(el, etype){
  if (el.fireEvent) {
    el.fireEvent('on' + etype);
  } else {
    var evObj = document.createEvent('Events');
    evObj.initEvent(etype, true, false);
    el.dispatchEvent(evObj);
  }
}

window.fire_event = fire_event

function repeat(params){
  let callback = params.callback
  let count = params.count || 1
  let current = 0
  let on_complete = params.on_complete
  let delay = params.delay || 0
  let rand_delay = params.rand_delay || 0

  
  if ( count === 0 ) {
    on_complete()
    return
  } else {
    repeat_canceled = false
    function run () {
      if ( repeat_canceled === true ) {
        on_complete();
        console.log("repeat canceled")
        repeat_canceled = false
        return;
      }

      console.log(`repeating task (${current + 1}/${count})`)
      
      try {
        callback(current)
      } catch ( err ) {
        console.warn( err )
      }

      current++
        if ( count === current ) {
          on_complete()
        } else {
          setTimeout( run, ( delay + Math.random() * rand_delay ) * constants.delay_multiplier )
        }
    }
  
    run()
  }
    
  

}

window.repeat = repeat

function makeid(length) {
  var result           = '';
  var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for ( var i = 0; i < length; i++ ) {
     result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

window.makeid = makeid

function quick_scroll ( scale, on_complete ) {
  TweenMax.fromTo( document.body.parentElement, constants.default_scroll_duration * scale, {
    scrollTop: document.body.parentElement.scrollTop
  }, {
    scrollTop: document.body.parentElement.scrollHeight,
    repeat: 0,
    onComplete: ()=>{
      on_complete && on_complete()
    }
  } )


  
}
window.quick_scroll = quick_scroll

function send_task_state ( id, completed, progress ) {
  send_message( {
    type: "task_state",
    data: {
      task_id: id,
      completed,
      progress
    }
  } )
}

function run_task( data ) {
  send_task_state(data.task_id, false, 0)
  let task_type = data.task_type
  tasks[ task_type ].callback( data )
}

function collect_state () {
  if ( window.location.href !== state.url ) {
    state.url = window.location.href
    quick_scroll(1.25)
  }

  console.log("collecting state... ")
  let page_type = window.location.href.split( "linkedin.com/" )[ 1 ]
  page_type = page_type.substring(0, page_type.length - 1)

  let invitations = []
  let invitations_els = document.querySelectorAll( ".invitation-card" ) 
  _.forEach( invitations_els, ( el, index )=>{
    let action_button = el.querySelector( "button + button" )
    if ( action_button ) {
      invitations.push({
        card_el: el,
        action_button
      })
    }
  } )

  let newcomers = []
  let newcomers_els = document.querySelectorAll( ".search-result.search-result__occluded-item" )

  _.forEach( newcomers_els, ( el, index )=>{
    let action_button = el.querySelector( ".search-result__actions button.search-result__action-button" )
    if ( action_button && action_button.innerText === "Установить контакт" ) {
      newcomers.push({
        card_el: el,
        action_button: action_button
      })
    }
  } )

  let newcomers2_els = document.querySelectorAll(".discover-entity-type-card")
  _.forEach(newcomers2_els, ( el, index )=>{
    let action_button = el.querySelector( "footer button.artdeco-button" )
    if ( action_button && action_button.innerText === "Установить контакт" ) {
      newcomers.push( {
        card_el: el,
        action_button: action_button
      } )
    }

  })

  let skillz = []
  let skillz_section = document.querySelector(".pv-skill-categories-section")

  if ( skillz_section ) {
    let expand_btn = skillz_section.querySelector( ".pv-skills-section__additional-skills" )
    if ( expand_btn && expand_btn.innerText.match(/Развернуть/gm) ) fire_event( expand_btn, "click" )
    let skill_cards = skillz_section.querySelectorAll( ".pv-skill-category-entity" )

    _.forEach( skill_cards, ( el, index ) => {
      let action_button = el.querySelector( ".pv-skill-entity__featured-endorse-button-shared" )
      // console.log(action_button)
      if ( action_button && action_button.getAttribute( "aria-pressed" ) !== "true" ) {
        skillz.push( {
          card_el: el,
          action_button: action_button
        } )
      }
    } )
  }

  let posts = []
  let posts_els = document.querySelectorAll( ".feed-shared-update-v2" )
  _.forEach( posts_els, ( el, index )=>{
    if ( !el ) {
      return
    }
    let action_button = el.querySelector( ".react-button__trigger" )
    if ( action_button && action_button.innerText === "Нравится" && action_button.getAttribute( "aria-pressed" ) !== "true" ) {
      posts.push( {
        card_el: el,
        action_button: action_button
      } )
    }
  } )

  let comments = []
  let comment_els = document.querySelectorAll("[data-control-name=comment_like_toggle][aria-pressed=false]")
  _.forEach( comment_els, ( el, index )=>{
    let action_button = el
    comments.push( {
      card_el: el,
      action_button: el
    } )
  } )

  state.page_type = page_type
  state.invitations = invitations
  state.newcomers = newcomers
  state.skillz = skillz
  state.posts = posts
  state.comments = comments

  send_message({
    type: "state",
    data: {
      page_type: state.page_type,
      invitations: state.invitations.length,
      newcomers: state.newcomers.length,
      skillz: state.skillz.length,
      posts: state.posts.length,
      comments: state.comments.length
    }
  })
  
  console.log("new state:", state)
}

collect_state = _.debounce(collect_state, 250)

document.addEventListener( "DOMContentLoaded", ()=>{
  quick_scroll(1.25)
  collect_state ()
 
} )

 // Выбираем целевой элемент
 var target = document;

 // Конфигурация observer (за какими изменениями наблюдать)
 const config = {
     attributes: true,
     childList: true,
     subtree: true
 }; 

 

 // Создаем экземпляр наблюдателя с указанной функцией обратного вызова
 const observer = new MutationObserver(collect_state);

 // Начинаем наблюдение за настроенными изменениями целевого элемента
 observer.observe(target, config);