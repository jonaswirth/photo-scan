import numpy as np
import cv2 as cv
import matplotlib.pyplot as plt

OUTPUT_WIDTH = 2480
OUTPUT_HEIGHT = 3508

def transform(img, corners):
    # Display input image
    input_img = img.copy()
    for corner in corners:
        input_img = cv.circle(input_img, (int(corner[0]),int(corner[1])), 25, (255, 0, 0), -1)

    plt.imshow(input_img)
    plt.show()

    # Homography transform
    output_img = np.zeros((OUTPUT_WIDTH, OUTPUT_HEIGHT, 3))
    new_corners = np.array([[0, 0],[OUTPUT_WIDTH, 0], [OUTPUT_WIDTH, OUTPUT_HEIGHT], [0, OUTPUT_HEIGHT]], dtype="float32")
    transform_mat = cv.getPerspectiveTransform(corners, new_corners)
    output_img = cv.warpPerspective(img, transform_mat, (OUTPUT_WIDTH, OUTPUT_HEIGHT), flags=cv.INTER_LINEAR)

    plt.imshow(output_img)
    plt.show()

    # TODO: Apply image effects such as sharpen, contrast enhancements, b/w ... 


if __name__ == "__main__":
    img = cv.imread("../public/test_doc.png")
    img = cv.cvtColor(img, cv.COLOR_BGR2RGB)
    corners = np.array([[690, 959], [2782, 1072], [2812, 3997], [638, 4101]], dtype="float32")
    transform(img, corners)
