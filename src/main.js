/**
 * |--------------|
 * |-Requirements-|
 * |--------------|
 * 1. User should be able to choose the number of required seats (max being 10).
 *
 * 2. When selecting the seats, if there are equal or more seats available
 * together, they should get auto selected (similar to BookMyShow).
 *
 * 3. Check for the corner cases like if user has already selected required
 * number of seats & still selecting the other, then previous one should be
 * removed based on order specified in Point 5.
 *
 * 4. User should be able to select required number of seats only from specific
 * category like Club, Executive or Normal seats.
 *
 * 5. Following priority needs to be taken care of when selecting & removing
 * seats.
 *    a) The first seat selected should be the start point i.e if user select a
 *    seat all continuous available seats adjacent to the right side of the
 *    selected one should be selected based on required no.of seats.
 *
 *    b) If there is no other combination possible as per step(a), it should not
 *    perform any action on clicking already selected seats.
 *
 *    c) If all the required number of seats are selected & user clicks on other
 *    seat (selected or not selected) it should remove previous selections &
 *    should assign seats based on mentioned step(a).
 *
 * |--------------|
 * |-Bonus Points-|
 * |--------------|
 * 1. Mark some seats having extra charges(Charges may also vary).
 *
 * 2. Calculate the total price of all the seats selected & the pay button
 * should display only when all the seats(as specified in required number of
 * seats) are selected.
 */

const seatsState = {
  /**
   * Seat config format:
   * {
   *   seatRowLetter: [firstSeatNo, lastSeatNo, blockedSeats, class]
   * }
   *
   * When a class is not specified for a row, presume that it is of the same
   * class as the previous row.
   */
  seatsConfig: {
    A: [1, 15, [3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15], 'Club'],
    B: [3, 15, [2, 5, 8]],
    C: [7, 15, [7, 8, 9, 10, 11, 12, 14], 'Executive'],
    D: [7, 15, [10, 11, 12, 13, 14, 15]],
    E: [7, 15],
    F: [7, 15],
    G: [3, 15, [4, 7, 10, 15]],
    H: [3, 15],
    I: [3, 15],
    J: [3, 15]
  },

  seatsQuantity: 1,

  updateSeatsQuantity(enteredQuantiy) {
    seatsState.seatsQuantity = enteredQuantiy;
    seatsState.seatsLeft = enteredQuantiy;
  },

  seatsLeft: 1,

  updateSeatsLeft(action) {
    switch (action) {
      case 'INCREMENT':
        seatsState.seatsLeft++;
        break;
      case 'DECREMENT':
        seatsState.seatsLeft--;
        break;
    }
  }
};

const handlers = {
  handleSeatQuantityChange(event) {
    seatsState.updateSeatsQuantity(event.target.value);

    view.displaySeats(seatsState.seatsConfig);
    view.displaySeatsLeft();
  },

  handleSeatSelection(event) {
    const elementClicked = event.target;

    const isAnchorTag = elementClicked.tagName === 'A';
    const isBlocked = elementClicked.classList.contains('blocked');
    const isSelected = elementClicked.classList.contains('selected');
    const areSeatsLeft = seatsState.seatsLeft !== 0;

    if (isAnchorTag && !isBlocked && (areSeatsLeft || isSelected)) {
      elementClicked.classList.toggle('selected');
      elementClicked.classList.toggle('available');

      const action = elementClicked.classList.contains('selected')
        ? 'DECREMENT'
        : 'INCREMENT';
      seatsState.updateSeatsLeft(action);

      let nextSibling = elementClicked.parentNode.nextSibling.firstChild;
      while (
        nextSibling &&
        !nextSibling.classList.contains('blocked') &&
        seatsState.seatsLeft !== 0
      ) {
        nextSibling.classList.toggle('selected');
        nextSibling.classList.toggle('available');
        const action = nextSibling.classList.contains('selected')
          ? 'DECREMENT'
          : 'INCREMENT';
        seatsState.updateSeatsLeft(action);

        try {
          nextSibling = nextSibling.parentNode.nextSibling.firstChild;
        } catch (e) {
          nextSibling = null;
          console.log(
            'Ran out of seats in this row. Please select more seats.'
          );
        }
      }
    }

    view.displaySeatsLeft();
  }
};

const view = {
  displaySeatQuantity(maxQuantity) {
    const seatQuantitySelect = document.querySelector('#seats-quantity');

    for (let i = 1; i <= maxQuantity; i++) {
      const seatQuantityOption = document.createElement('option');
      seatQuantityOption.value = i;
      seatQuantityOption.innerHTML = i;

      seatQuantitySelect.appendChild(seatQuantityOption);
    }
  },

  displaySeatsLeft() {
    const seatsLeftSpan = document.querySelector('#seats-left');
    seatsLeftSpan.innerHTML = seatsState.seatsLeft;
  },

  displaySeats(seatsConfig) {
    const seatMatrix = {};

    Object.keys(seatsConfig).forEach(key => {
      const rowConfig = seatsConfig[key];
      let seatRow = [];
      for (let i = rowConfig[0]; i <= rowConfig[1]; i++) {
        seatRow.push(i);
      }
      seatMatrix[key] = seatRow;
    });

    const seatTable = document.querySelector('#seats-table');
    seatTable.innerHTML = '';

    Object.keys(seatMatrix).forEach(seatLetter => {
      const seatRow = seatMatrix[seatLetter];

      const seatRowTr = document.createElement('tr');
      seatRowTr.className = 'row';

      if (seatsConfig[seatLetter][3]) {
        const seatClassH3 = document.createElement('h3');
        seatClassH3.innerHTML = seatsConfig[seatLetter][3];
        seatRowTr.appendChild(seatClassH3);
      }

      const seatColumnTd = document.createElement('td');
      seatColumnTd.className = 'seat-row';

      const seatColumnSpan = document.createElement('span');
      seatColumnSpan.innerHTML = seatLetter;
      seatColumnTd.appendChild(seatColumnSpan);

      seatRow.forEach((seatColumn, columnIndex) => {
        const seatColumnDiv = document.createElement('div');
        seatColumnDiv.className = 'seat';

        const seatColumnA = document.createElement('a');
        if (
          seatsConfig[seatLetter][2] &&
          seatsConfig[seatLetter][2].includes(columnIndex + 1)
        ) {
          seatColumnA.className = 'blocked';
        } else {
          seatColumnA.className = 'available';
        }
        seatColumnA.innerHTML = seatColumn;
        seatColumnDiv.appendChild(seatColumnA);

        seatColumnTd.appendChild(seatColumnDiv);
      });

      seatRowTr.appendChild(seatColumnTd);
      seatTable.appendChild(seatRowTr);
    });
  },

  setupEventListeners() {
    const seatQuantitySelect = document.querySelector('#seats-quantity');
    seatQuantitySelect.addEventListener(
      'change',
      handlers.handleSeatQuantityChange
    );

    const seatsTable = document.querySelector('#seats-table');
    seatsTable.addEventListener('click', handlers.handleSeatSelection);
  }
};

const init = () => {
  view.displaySeatQuantity(10);
  view.displaySeats(seatsState.seatsConfig);
  view.displaySeatsLeft();
  view.setupEventListeners();
};

init();
